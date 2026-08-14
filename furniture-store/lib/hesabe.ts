import crypto from 'crypto';

/**
 * Hesabe payment gateway helper (hosted checkout).
 *
 * Flow:
 *   1. encrypt(payload) with AES-256-CBC (hex output, matching Hesabe's
 *      `HesabeCrypt` PHP library) and POST it to `${BASE}/checkout` with the
 *      `accessCode` header.
 *   2. Decrypt the response to get a payment token.
 *   3. Redirect the customer to `${BASE}/payment?data=<token>`.
 *   4. Hesabe redirects back to our callback with an encrypted `data` param,
 *      which we decrypt and verify.
 *
 * All secrets come from environment variables — never hard-code them.
 */

const BASE = (process.env.HESABE_BASE_URL || 'https://api.hesabe.com').replace(/\/+$/, '');
const MERCHANT_CODE = process.env.HESABE_MERCHANT_CODE || '';
const ACCESS_CODE = process.env.HESABE_ACCESS_CODE || '';
const SECRET_KEY = process.env.HESABE_SECRET_KEY || '';
const IV = process.env.HESABE_IV || '';

export function hesabeConfigured(): boolean {
  return Boolean(MERCHANT_CODE && ACCESS_CODE && SECRET_KEY && IV);
}

export const HESABE_PAYMENT_URL = `${BASE}/payment`;

/** AES-256-CBC encrypt → hex (mirrors HesabeCrypt::encrypt). */
export function encrypt(plain: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
  return Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]).toString('hex');
}

/** hex → AES-256-CBC decrypt (mirrors HesabeCrypt::decrypt). */
export function decrypt(hex: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
  return Buffer.concat([decipher.update(Buffer.from(hex, 'hex')), decipher.final()]).toString('utf8');
}

export interface CheckoutParams {
  amount: number;
  orderReferenceNumber: string; // our order id
  responseUrl: string;          // absolute URL to our callback
  failureUrl: string;           // absolute URL to our callback
  currency?: string;            // default KWD
}

/**
 * Calls Hesabe /checkout and returns the full URL to redirect the customer to.
 * Throws with a descriptive message on any failure.
 */
export async function createHesabeCheckout(params: CheckoutParams): Promise<string> {
  if (!hesabeConfigured()) {
    throw new Error('Hesabe is not configured (missing env vars).');
  }

  const payload = {
    merchantCode: MERCHANT_CODE,
    amount: Number(params.amount).toFixed(3), // KWD has 3 decimals
    currency: params.currency || 'KWD',
    paymentType: '0', // 0 = show all enabled methods (KNET, cards, Apple Pay)
    responseUrl: params.responseUrl,
    failureUrl: params.failureUrl,
    version: '2.0',
    orderReferenceNumber: params.orderReferenceNumber,
    variable1: params.orderReferenceNumber, // echoed back — extra safety net
  };

  const encrypted = encrypt(JSON.stringify(payload));

  const res = await fetch(`${BASE}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      accessCode: ACCESS_CODE,
    },
    body: JSON.stringify({ data: encrypted }),
  });

  const text = await res.text();
  const token = extractToken(text);
  if (!token) {
    throw new Error(`Hesabe checkout failed (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  return `${HESABE_PAYMENT_URL}?data=${encodeURIComponent(token)}`;
}

/**
 * Hesabe's /checkout response comes in a couple of shapes depending on account
 * config: either plain JSON `{ response: { data: token } }`, or an encrypted
 * hex body that decrypts to that JSON. Handle both.
 */
function extractToken(body: string): string | null {
  // 1. Plain JSON with the token already exposed.
  const fromJson = (raw: string): string | null => {
    try {
      const j = JSON.parse(raw);
      if (j?.response?.data && typeof j.response.data === 'string') return j.response.data;
      if (typeof j?.data === 'string' && /^[0-9a-f]+$/i.test(j.data)) {
        // `data` is itself an encrypted hex blob → decrypt then recurse.
        return fromJson(decrypt(j.data));
      }
    } catch { /* not JSON */ }
    return null;
  };

  const direct = fromJson(body);
  if (direct) return direct;

  // 2. Whole body is an encrypted hex string.
  if (/^[0-9a-f]+$/i.test(body.trim())) {
    try { return fromJson(decrypt(body.trim())); } catch { /* fall through */ }
  }
  return null;
}

export interface HesabeResult {
  ok: boolean;
  orderReferenceNumber: string | null;
  amount: number | null;
  paymentId: string | null;
  paymentToken: string | null;
  method: string | null;
  resultCode: string | null;
  raw: any;
}

const SUCCESS_CODES = new Set(['CAPTURED', 'ACCEPT', 'SUCCESS']);

/** Decrypt + interpret the `data` param Hesabe sends to our callback. */
export function parseHesabeCallback(encryptedData: string): HesabeResult {
  const json = JSON.parse(decrypt(encryptedData));
  // Payment fields may sit at the top level or under `.response`.
  const r = json.response ?? json;
  const resultCode = String(r.resultCode ?? r.result ?? '').toUpperCase();
  const ok = (json.status === true || r.status === true) && SUCCESS_CODES.has(resultCode);
  return {
    ok,
    orderReferenceNumber: r.orderReferenceNumber ?? r.variable1 ?? null,
    amount: r.amount != null ? Number(r.amount) : null,
    paymentId: r.paymentId ?? null,
    paymentToken: r.paymentToken ?? null,
    method: r.paymentType ?? r.method ?? null,
    resultCode: resultCode || null,
    raw: json,
  };
}
