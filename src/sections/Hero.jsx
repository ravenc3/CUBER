import BrandLogo from '../components/BrandLogo.jsx'

function Hero({ copy }) {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-image" role="img" aria-label={copy.imageAlt} />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-content">
        <p className="hero-kicker"><span /> {copy.kicker}</p>
        <BrandLogo className="brand-logo brand-logo-hero" />
        <h1 id="hero-title">Build your<br /><span>legacy.</span></h1>
        <div className="hero-bottom">
          <p>{copy.description}</p>
          <a className="text-link hero-link" href="#builds">
            {copy.explore} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className="hero-caption" aria-hidden="true">
        <span>{copy.caption}</span>
        <span>{copy.imagePosition}</span>
      </div>
    </section>
  )
}

export default Hero
