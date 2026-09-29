import SectionIntro from '../components/SectionIntro.jsx'

function About({ copy }) {
  return (
    <section className="about-section" id="about">
      <div className="about-topline">
        <span className="eyebrow">{copy.eyebrow}</span>
        <span className="about-coordinate">{copy.established}</span>
      </div>
      <div className="about-content">
        <SectionIntro title={<>{copy.titleFirst}<br /><em>{copy.titleSecond}</em></>} />
        <div className="about-copy">
          <p className="about-lead">{copy.lead}</p>
          <p>{copy.description}</p>
          <a className="text-link" href="#contact">
            {copy.link} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default About
