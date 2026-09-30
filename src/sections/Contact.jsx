function Contact({ copy }) {
  return (
    <section className="contact-section" id="contact">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.titleFirst}<br /><span>{copy.titleSecond}</span></h2>
      </div>
      <div className="contact-aside">
        <p>{copy.description}</p>
        <a className="contact-button" href="mailto:cuberbuilds@gmail.com">
          {copy.button} <span aria-hidden="true">↗</span>
        </a>
        <a className="contact-email" href={`mailto:${copy.email}`}>
          <svg className="contact-icon" viewBox="0 0 20 20" aria-hidden="true">
            <rect x="2.5" y="4" width="15" height="12" rx="1" />
            <path d="m3 5 7 6 7-6" />
          </svg>
          {copy.email}
        </a>
        <a className="contact-email" href="tel:+905348596233">
          <svg className="contact-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path d="m6.2 2.8 2.1 3.8-1.6 1.6a12.2 12.2 0 0 0 5.1 5.1l1.6-1.6 3.8 2.1-.5 3a1.5 1.5 0 0 1-1.7 1.2A15.8 15.8 0 0 1 2 5a1.5 1.5 0 0 1 1.2-1.7z" />
          </svg>
          05348596233
        </a>
        <a className="contact-email" href="https://t.me/Cuber_builds">
          <svg className="contact-icon contact-icon-telegram" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8.25" />
            <path d="m4.7 9.6 10.5-4-2 9.1-3.1-2.3-1.7 1.6.3-3 5.1-4.6-6.3 3.8z" />
          </svg>
          @Cuber_builds
        </a>
      </div>
      <span className="contact-mark" aria-hidden="true">C.</span>
    </section>
  )
}

export default Contact
