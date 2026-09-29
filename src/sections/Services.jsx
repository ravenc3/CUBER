import SectionIntro from '../components/SectionIntro.jsx'

function Services({ copy }) {
  return (
    <section className="section services-section" id="services">
      <SectionIntro
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <div className="service-list">
        {copy.items.map((service, index) => (
          <article className="service-row" key={service.title}>
            <span className="service-number">0{index + 1}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span className="service-mark" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Services
