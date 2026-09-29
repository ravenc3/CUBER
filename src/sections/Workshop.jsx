import SectionIntro from '../components/SectionIntro.jsx'

function Workshop({ copy }) {
  return (
    <section className="workshop-section" id="workshop">
      <div className="workshop-copy">
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
        />
        <p>{copy.description}</p>
        <a className="text-link" href="#about">
          {copy.link} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}

export default Workshop
