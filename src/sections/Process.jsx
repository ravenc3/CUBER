import SectionIntro from '../components/SectionIntro.jsx'

function Process({ copy }) {
  return (
    <section className="section process-section" id="process">
      <div className="process-heading">
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
        />
        <p>{copy.intro}</p>
      </div>
      <ol className="process-list">
        {copy.steps.map((step, index) => (
          <li className="process-step" key={step.title}>
            <span className="process-number">0{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Process
