function Contact({ copy }) {
  return (
    <section className="contact-section" id="contact">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.titleFirst}<br /><span>{copy.titleSecond}</span></h2>
      </div>
      <div className="contact-aside">
        <p>{copy.description}</p>
        <a className="contact-button" href="mailto:hello@cuber.work">
          {copy.button} <span aria-hidden="true">↗</span>
        </a>
        <a className="contact-email" href={`mailto:${copy.email}`}>{copy.email}</a>
      </div>
      <span className="contact-mark" aria-hidden="true">C.</span>
    </section>
  )
}

export default Contact
