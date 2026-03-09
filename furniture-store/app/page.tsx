export default function HomePage() {
  return (
    <>
      <section className="homepage-shell">
        <div className="container">
          <div className="homepage-frame">
            <div className="row g-0 align-items-stretch homepage-hero-row">
              <div className="col-lg-7">
                <div className="homepage-left-panel">
                  <div className="mini-gallery-strip fade-in-up fade-delay-1">
                    <img
                      src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80"
                      alt="Luxury sofa corner"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=500&q=80"
                      alt="Elegant bedroom"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=500&q=80"
                      alt="Premium dining space"
                    />
                  </div>

                  <div className="hero-copy-block">
                    <h1 className="smartwood-title fade-in-up fade-delay-2">
                      SMARTWOOD
                    </h1>

                    <h2 className="smartwood-subtitle fade-in-up fade-delay-3">
                      Furniture crafted for refined living
                    </h2>

                    <p className="smartwood-description fade-in-up fade-delay-4">
                      Discover premium sofas, bedrooms, dining pieces, and
                      statement interiors designed to bring elegance, comfort,
                      and timeless presence into every space.
                    </p>

                    <div className="hero-main-actions fade-in-up fade-delay-4">
                      <a href="/shop" className="hero-primary-btn">
                        Shop Now
                      </a>
                    </div>
                  </div>

                  <div className="hero-bottom-note fade-in-up fade-delay-4">
                    <span className="hero-note-index">01</span>
                    <div>
                      <div className="hero-note-label">Smartwood Collection</div>
                      <div className="hero-note-text">
                        Modern furniture with bold materials and calm luxury.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="homepage-right-visual fade-in-up fade-delay-2">
                  <div className="hero-image-overlay"></div>
                  <div className="hero-image-caption">
                    <span>AUTHENTIC</span>
                    <span>INTERIORS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container">
          <div className="section-heading-wrap fade-in-up fade-delay-1">
            <span className="section-kicker">Featured Categories</span>
            <h2 className="section-title">Designed for every room</h2>
            <p className="section-text">
              From statement sofas to elegant bedrooms and crafted dining
              pieces, Smartwood creates furniture collections shaped around how
              people live, host, and unwind.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-xl-3">
              <div className="furniture-card fade-in-up fade-delay-1">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
                  alt="Sofas"
                />
                <div className="furniture-card-body">
                  <h3>Sofas</h3>
                  <p>Comfort-driven silhouettes with strong visual presence.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="furniture-card fade-in-up fade-delay-2">
                <img
                  src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
                  alt="Bedrooms"
                />
                <div className="furniture-card-body">
                  <h3>Bedrooms</h3>
                  <p>Quiet luxury for restful spaces and elevated comfort.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="furniture-card fade-in-up fade-delay-3">
                <img
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80"
                  alt="Dining"
                />
                <div className="furniture-card-body">
                  <h3>Dining</h3>
                  <p>Crafted tables and chairs made for memorable gatherings.</p>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="furniture-card fade-in-up fade-delay-4">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80"
                  alt="Accent pieces"
                />
                <div className="furniture-card-body">
                  <h3>Accent Pieces</h3>
                  <p>Chairs, side tables, and details that complete the room.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing pt-0">
        <div className="container">
          <div className="smartwood-story-panel fade-in-up fade-delay-2">
            <div className="row g-4 align-items-center">
              <div className="col-lg-6">
                <span className="section-kicker">About Smartwood</span>
                <h2 className="section-title">A furniture brand built around timeless interiors</h2>
                <p className="section-text">
                  Smartwood focuses on pieces that feel polished, durable, and
                  visually calm. The goal is not just to furnish a room, but to
                  shape a complete living atmosphere through material, form, and
                  balance.
                </p>
                <a href="/about" className="hero-secondary-btn">
                  Learn More
                </a>
              </div>

              <div className="col-lg-6">
                <div className="story-side-grid">
                  <img
                    src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
                    alt="Luxury living room"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80"
                    alt="Chair detail"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80"
                    alt="Furniture styling"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}