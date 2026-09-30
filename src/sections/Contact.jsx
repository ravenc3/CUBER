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
        <a className="contact-email" href={`mailto:${copy.email}`}>{copy.email}</a>
        <a className="contact-email" href="tel:+905348596233">05348596233</a>
        <a className="contact-email" href="https://t.me/Cuber_builds">@Cuber_builds</a>
      </div>
      <span className="contact-mark" aria-hidden="true">C.</span>
    </section>
  )
}

export default Contact
