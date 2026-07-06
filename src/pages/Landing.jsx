import { Link } from 'react-router-dom'
import { BeadCounter } from '../components/BeadCounter'
import '../styles/hero.css'
import '../styles/story.css'

export const Landing = () => (
  <main>
    <section className="hero">
      <div className="container">
        <p className="hero__label">Bracelets 4 Recovery</p>
        <h1 className="hero__title">
          Crafting <em>resilience</em>, one bead at a time.
        </h1>
        <p className="hero__text">
          B4R turns the therapeutic art of crafting into a symbol of resilience.
          Every piece is handmade by individuals navigating their recovery journey,
          transforming raw materials into a wearable reminder of strength, focus,
          and community support.
        </p>
        <Link to="/products" className="hero__cta">
          Explore bracelets
        </Link>
      </div>
    </section>

    <BeadCounter />

    <section className="story">
      <div className="container">
        <div className="story__intro">
          <p className="hero__label">A handmade ritual</p>
          <h2 className="story__heading">Crafted for calm, connection, and recovery.</h2>
          <p className="story__lede">
            Each bracelet carries the warmth of a thoughtfully made object and the
            quiet reassurance of a daily ritual that feels personal and grounding.
          </p>
        </div>
        <div className="story__grid">
          <div className="story__card">
            <p className="story__sub">Vision</p>
            <h3>Weaving a global community</h3>
            <p>
              To weave a global community of support, mindfulness, and renewal,
              where every bead represents a step forward, and every handmade
              bracelet serves as a wearable reminder that recovery is a journey
              best traveled together.
            </p>
          </div>
          <div className="story__card">
            <p className="story__sub">Mission</p>
            <h3>Grounding through craft</h3>
            <p>
              B4R provides a creative, grounding outlet for individuals navigating
              the recovery process. Through the therapeutic practice of jewelry
              crafting, we foster mindfulness, build supportive community
              connections, and create meaningful, wearable symbols of strength.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="landing-panel">
      <div className="container">
        <div className="landing-panel__grid">
          <article className="testimonial-card">
            <p className="testimonial__quote">
              “The bracelets feel like a gentle reminder that I can carry care with me.
              They are beautiful, calm, and deeply personal.”
            </p>
            <div className="testimonial__meta">
              <strong>Mina L.</strong>
              <span>Recovery circle member</span>
            </div>
          </article>
          <aside className="newsletter-card">
            <p className="newsletter__eyebrow">Stay connected</p>
            <h3>Receive a monthly note from the studio</h3>
            <p>Join our list for new drops, thoughtful reflections, and behind-the-scenes stories.</p>
            <form className="newsletter__form">
              <input className="newsletter__input" type="email" placeholder="Email address" />
              <button className="newsletter__button" type="submit">Join</button>
            </form>
          </aside>
        </div>
      </div>
    </section>
  </main>
)
