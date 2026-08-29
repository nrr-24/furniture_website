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

// Hesabe's HesabeCrypt uses AES-256-CBC with a *32-byte-block* PKCS pad (pad
// bytes each equal to the pad length), hex-encoded, key/IV as raw UTF-8 bytes.
// Node's built-in cipher only does standard 16-byte PKCS7, so we disable its
// auto-padding and apply the 32-byte-block padding ourselves — otherwise
// Hesabe can't read our request and its response fails to decrypt ("bad
// decrypt", because its pad values run up to 32).
const HESABE_BLOCK = 32;

function pkcsPad(buf: Buffer): Buffer {
  const padLen = HESABE_BLOCK - (buf.length % HESABE_BLOCK); // 1..32
  return Buffer.concat([buf, Buffer.alloc(padLen, padLen)]);
}

function pkcsUnpad(buf: Buffer): Buffer {
  if (buf.length === 0) return buf;
  const padLen = buf[buf.length - 1];
  if (padLen < 1 || padLen > HESABE_BLOCK || padLen > buf.length) return buf;
  return buf.subarray(0, buf.length - padLen);
}

/** AES-256-CBC encrypt → hex (mirrors HesabeCrypt::encrypt). */
export function encrypt(plain: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
  cipher.setAutoPadding(false);
  const padded = pkcsPad(Buffer.from(plain, 'utf8'));
  return Buffer.concat([cipher.update(padded), cipher.final()]).toString('hex');
}

/** hex → AES-256-CBC decrypt (mirrors HesabeCrypt::decrypt). */
export function decrypt(hex: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), Buffer.from(IV));
  decipher.setAutoPadding(false);
  const out = Buffer.concat([decipher.update(Buffer.from(hex, 'hex')), decipher.final()]);
  return pkcsUnpad(out).toString('utf8');
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

  // AES-256-CBC needs a 32-byte key and 16-byte IV. Catch the most common
  // config slip (stray whitespace/newline making the value the wrong length)
  // with a clear message instead of a downstream "bad decrypt".
  const keyLen = Buffer.byteLength(SECRET_KEY);
  const ivLen = Buffer.byteLength(IV);
  if (keyLen !== 32 || ivLen !== 16) {
    throw new Error(
      `Hesabe key/IV wrong length: HESABE_SECRET_KEY is ${keyLen} bytes (needs 32), ` +
      `HESABE_IV is ${ivLen} bytes (needs 16). Check for extra spaces/quotes/newline in Vercel.`
    );
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

  // Decode the response: it's usually an encrypted hex blob, sometimes plain
  // JSON. Decrypt if it looks like hex, then parse.
  let decoded = text.trim();
  if (isHex(decoded)) {
    try {
      decoded = decrypt(decoded);
    } catch (e) {
      throw new Error(
        `Hesabe response could not be decrypted (HTTP ${res.status}) — check HESABE_SECRET_KEY / HESABE_IV. ${(e as Error).message}`
      );
    }
  }

  let json: any;
  try {
    json = JSON.parse(decoded);
  } catch {
    throw new Error(`Hesabe response was not JSON after decrypt (HTTP ${res.status}): ${decoded.slice(0, 200)}`);
  }

  const token = pickToken(json);
  if (!token) {
    // Surface Hesabe's own error / the response shape so failures are diagnosable.
    const msg = json?.message || json?.response?.message || json?.error || '';
    throw new Error(
      `Hesabe checkout returned no payment token (HTTP ${res.status}). ` +
      `status=${json?.status} code=${json?.code} message=${msg} keys=[${Object.keys(json).join(',')}] ` +
      `response=${JSON.stringify(json?.response)?.slice(0, 200)}`
    );
  }
  return `${HESABE_PAYMENT_URL}?data=${encodeURIComponent(token)}`;
}

function isHex(s: string): boolean {
  return s.length > 0 && s.length % 2 === 0 && /^[0-9a-f]+$/i.test(s);
}

/**
 * Pull the payment token out of Hesabe's (decrypted) /checkout response.
 * Documented shape is `{ response: { data: "<token>" } }`, but be lenient about
 * where the token sits across account/version differences.
 */
function pickToken(json: any): string | null {
  if (!json) return null;
  const r = json.response ?? {};
  const candidates = [
    r?.data,
    typeof json.response === 'string' ? json.response : null,
    r?.paymentToken,
    r?.token,
    json?.data,
    json?.paymentToken,
    json?.token,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 8) return c.trim();
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
