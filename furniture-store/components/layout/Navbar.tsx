'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="navbar-luxury-wrap">
            <div className="container">
                <div className="navbar-luxury-inner">
                    <Link href="/" className="brand-link">
                        <span className="brand-mark">È</span>
                    </Link>

                    <div className="nav-center-pills">
                        <Link href="/" className="nav-pill-link">
                            Home
                        </Link>
                        <Link href="/shop" className="nav-pill-link">
                            Shop
                        </Link>
                        <Link href="/about" className="nav-pill-link">
                            About
                        </Link>
                        <Link href="/cart" className="nav-pill-link">
                            Cart
                        </Link>
                    </div>

                    <div className="nav-right-actions">
                        <button className="lang-switch-btn">AR</button>
                        <Link href="/shop" className="contact-cta-btn">
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}