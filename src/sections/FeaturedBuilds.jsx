import BuildCard from '../components/BuildCard.jsx'
import SectionIntro from '../components/SectionIntro.jsx'
import { useEffect, useState } from 'react'
import { mapBuildForLanguage } from '../lib/builds.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function FeaturedBuilds({ copy, language }) {
  const [databaseBuilds, setDatabaseBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        <div className="build-grid">
          {builds.map((build, index) => (
            <BuildCard
              key={build.id}
              build={build}
              enquireTemplate={copy.enquire}
              specsLabelTemplate={copy.specsLabel}
              moreSpecsTemplate={copy.moreSpecs}
              lightboxCopy={copy.lightbox}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedBuilds
