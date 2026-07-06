import '../styles/footer.css'

export const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <span className="footer__copy">&copy; {new Date().getFullYear()} Bracelets 4 Recovery</span>
      <span className="footer__tagline">Every bead tells a story of resilience.</span>
    </div>
  </footer>
)
