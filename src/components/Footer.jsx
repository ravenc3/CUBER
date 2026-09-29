import BrandLogo from './BrandLogo.jsx'

function Footer({ copy }) {
  return (
    <footer className="site-footer">
      <a className="brand-link footer-brand-link" href="#top" aria-label={copy.home}>
        <BrandLogo className="brand-logo brand-logo-footer" />
      </a>
      <p>{copy.tagline}</p>
      <a className="back-to-top" href="#top">
        {copy.backToTop} <span aria-hidden="true">↑</span>
      </a>
      <span className="footer-copyright">
        {copy.copyright.replace('{year}', new Date().getFullYear())}
      </span>
    </footer>
  )
}

export default Footer
