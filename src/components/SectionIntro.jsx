function SectionIntro({ eyebrow, title, description, className = '' }) {
  return (
    <div className={`section-intro ${className}`.trim()}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

export default SectionIntro
