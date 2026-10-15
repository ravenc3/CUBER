import BuildCard from '../components/BuildCard.jsx'
import SectionIntro from '../components/SectionIntro.jsx'
import { useEffect, useRef, useState } from 'react'
import { mapBuildForLanguage } from '../lib/builds.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function FeaturedBuilds({ copy, language }) {
  const [databaseBuilds, setDatabaseBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeBuild, setActiveBuild] = useState(0)
  const carouselRef = useRef(null)

  useEffect(() => {
    let active = true
    let subscription

    async function loadBuilds() {
      try {
        const rows = await supabase.listBuilds()
        if (active) setDatabaseBuilds(rows)
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (isSupabaseConfigured) {
      subscription = supabase.subscribeToBuilds(() => {
        if (active) loadBuilds()
      })
    }
    loadBuilds()
    return () => {
      active = false
      if (subscription) supabase.removeBuildSubscription(subscription)
    }
  }, [])

  const builds = databaseBuilds.map((build) =>
    mapBuildForLanguage(build, language, copy.specLabels),
  )
  const currentBuild = Math.min(activeBuild, builds.length - 1)

  function goToBuild(index) {
    const carousel = carouselRef.current
    const slide = carousel?.children[index]
    if (!slide) return
    slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    setActiveBuild(index)
  }

  function updateActiveBuild() {
    const carousel = carouselRef.current
    if (!carousel) return
    const carouselLeft = carousel.getBoundingClientRect().left
    let closestIndex = 0
    let closestDistance = Infinity

    Array.from(carousel.children).forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - carouselLeft)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    setActiveBuild(closestIndex)
  }

  return (
    <section className="section builds-section" id="builds">
      <div className="section-heading-row">
        <SectionIntro
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <span className="section-count">
          {copy.count.replace('{count}', String(databaseBuilds.length).padStart(2, '0'))}
        </span>
      </div>
      {loading && <p className="builds-message">{copy.loading}</p>}
      {!loading && error && (
        <p className="builds-message builds-message-error" role="alert">
          {isSupabaseConfigured ? `${copy.loadError} ${error}` : copy.configurationError}
        </p>
      )}
      {!loading && !error && builds.length === 0 && (
        <p className="builds-message">{copy.empty}</p>
      )}
      {!loading && !error && builds.length > 0 && (
        <div className="build-carousel">
          <div
            ref={carouselRef}
            className="build-carousel-track"
            role="region"
            aria-label={copy.title.replace('\n', ' ')}
            aria-roledescription="carousel"
            onScroll={updateActiveBuild}
          >
            {builds.map((build, index) => (
              <div
                className="build-carousel-slide"
                key={build.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${builds.length}`}
              >
                <BuildCard
                  build={build}
                  enquireTemplate={copy.enquire}
                  specsLabelTemplate={copy.specsLabel}
                  moreSpecsTemplate={copy.moreSpecs}
                  lightboxCopy={copy.lightbox}
                  detailsCopy={copy.details}
                  index={index}
                />
              </div>
            ))}
          </div>
          {builds.length > 1 && (
            <div className="build-carousel-controls">
              <div className="build-carousel-pagination" aria-label={copy.paginationLabel}>
                {builds.map((build, index) => (
                  <button
                    key={build.id}
                    className={`build-carousel-dot${index === currentBuild ? ' is-active' : ''}`}
                    type="button"
                    aria-label={copy.showBuild.replace('{number}', String(index + 1))}
                    aria-current={index === currentBuild ? 'true' : undefined}
                    onClick={() => goToBuild(index)}
                  />
                ))}
              </div>
              <div className="build-carousel-arrows">
                <button
                  type="button"
                  className="build-carousel-arrow"
                  aria-label={copy.previous}
                  disabled={currentBuild === 0}
                  onClick={() => goToBuild(currentBuild - 1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="build-carousel-arrow"
                  aria-label={copy.next}
                  disabled={currentBuild >= builds.length - 1}
                  onClick={() => goToBuild(currentBuild + 1)}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default FeaturedBuilds
