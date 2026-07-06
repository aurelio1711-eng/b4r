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
        <h2 className="story__heading">The Story Behind the String</h2>
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
  </main>
)
