import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function BuildCard({
  build,
  enquireTemplate,
  specsLabelTemplate,
  moreSpecsTemplate,
  lightboxCopy,
  detailsCopy,
  index,
}) {
  const name = build.name
  const images = build.images?.length ? build.images : build.image ? [build.image] : []
  const [activeImage, setActiveImage] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const detailsCloseButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const imageButtonRef = useRef(null)
  const pointerStart = useRef(null)
  const suppressClick = useRef(false)
  const isLightboxOpen = activeImage !== null

  useEffect(() => {
    if (!isLightboxOpen) return undefined

    const imageButton = imageButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') setActiveImage(null)
      const isRtl = document.documentElement.dir === 'rtl'
      if (event.key === 'Tab') {
        const buttons = dialogRef.current?.querySelectorAll('button:not(:disabled)')
        if (!buttons?.length) return

        const firstButton = buttons[0]
        const lastButton = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault()
          lastButton.focus()
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault()
          firstButton.focus()
        }
      }
      if (images.length > 1 && event.key === (isRtl ? 'ArrowLeft' : 'ArrowRight')) {
        setActiveImage((current) => (current + 1) % images.length)
      }
      if (images.length > 1 && event.key === (isRtl ? 'ArrowRight' : 'ArrowLeft')) {
        setActiveImage((current) => (current - 1 + images.length) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      imageButton?.focus()
    }
  }, [isLightboxOpen, images.length])

  useEffect(() => {
    if (!detailsOpen) return undefined

    const imageButton = imageButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    detailsCloseButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !document.querySelector('.build-lightbox')) {
        setDetailsOpen(false)
      }
      if (event.key === 'Tab' && !document.querySelector('.build-lightbox')) {
        const controls = document.querySelector('.build-details-dialog')
          ?.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')
        if (!controls?.length) return

        const firstControl = controls[0]
        const lastControl = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault()
          lastControl.focus()
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault()
          firstControl.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      imageButton?.focus()
    }
  }, [detailsOpen])

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + images.length) % images.length)
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % images.length)
  }

  function handleCardClick(event) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (event.target.closest('button, a, summary, details')) return
    setDetailsOpen(true)
  }

  function handleCardPointerDown(event) {
    pointerStart.current = { x: event.clientX, y: event.clientY }
  }

  function handleCardPointerUp(event) {
    if (!pointerStart.current) return
    const moved = Math.hypot(
      event.clientX - pointerStart.current.x,
      event.clientY - pointerStart.current.y,
    ) > 10
    suppressClick.current = moved
    pointerStart.current = null
    if (moved) {
      window.setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }
  }

  return (
    <>
      <article
        className="build-card"
        tabIndex={0}
        aria-label={enquireTemplate.replace('{name}', name)}
        aria-haspopup="dialog"
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            setDetailsOpen(true)
          }
        }}
        onPointerDown={handleCardPointerDown}
        onPointerUp={handleCardPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null
          suppressClick.current = false
        }}
      >
        {build.image ? (
          <button
            ref={imageButtonRef}
            className="build-image-link"
            type="button"
            aria-label={enquireTemplate.replace('{name}', name)}
            onClick={() => setDetailsOpen(true)}
          >
            <img className="build-image" src={build.image} alt={build.imageAlt} loading="lazy" />
            <span className="build-index">0{index + 1}</span>
            <span className="build-arrow" aria-hidden="true">↗</span>
          </button>
        ) : (
          <div className="build-image-link">
            <span className="build-image-placeholder" dir="auto">{name}</span>
            <span className="build-index">0{index + 1}</span>
          </div>
        )}
        <div className="build-card-copy">
          <p className="build-category" dir="auto">{build.category}</p>
          <h3 dir="auto">{name}</h3>
          <p className="build-description" dir="auto">{build.description}</p>
        </div>
        {build.specs.length > 0 && (
          <ul className="build-specs" aria-label={specsLabelTemplate.replace('{name}', name)}>
            {build.specs.slice(0, 4).map((spec, specIndex) => (
              <li key={`${spec.label}-${spec.value}-${specIndex}`}>
                {spec.label && <span className="build-spec-label">{spec.label}: </span>}
                <bdi dir={spec.label ? 'ltr' : 'auto'}>{spec.value}</bdi>
              </li>
            ))}
          </ul>
        )}
        {build.specs.length > 4 && (
          <details className="build-additional-specs">
            <summary>
              {moreSpecsTemplate.replace('{count}', String(build.specs.length - 4))}
            </summary>
            <ul className="build-specs" aria-label={specsLabelTemplate.replace('{name}', name)}>
              {build.specs.slice(4).map((spec, specIndex) => (
                <li key={`${spec.label}-${spec.value}-${specIndex}`}>
                  {spec.label && <span className="build-spec-label">{spec.label}: </span>}
                  <bdi dir={spec.label ? 'ltr' : 'auto'}>{spec.value}</bdi>
                </li>
              ))}
            </ul>
          </details>
        )}
      </article>
      {detailsOpen && createPortal(
        <div
          className="build-details-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDetailsOpen(false)
          }}
        >
          <section
            className="build-details-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`build-details-title-${build.id}`}
          >
            <button
              ref={detailsCloseButtonRef}
              className="build-details-close"
              type="button"
              aria-label={detailsCopy.close}
              onClick={() => setDetailsOpen(false)}
            >
              ×
            </button>
            <p className="build-category" dir="auto">{build.category}</p>
            <h2 id={`build-details-title-${build.id}`} dir="auto">{name}</h2>
            <p className="build-details-description" dir="auto">{build.description}</p>
            <div className="build-details-section">
              <h3>{specsLabelTemplate.replace('{name}', name)}</h3>
              {build.specs.length > 0 ? (
                <ul className="build-specs">
                  {build.specs.map((spec, specIndex) => (
                    <li key={`${spec.label}-${spec.value}-${specIndex}`}>
                      {spec.label && <span className="build-spec-label">{spec.label}: </span>}
                      <bdi dir={spec.label ? 'ltr' : 'auto'}>{spec.value}</bdi>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="build-details-empty">—</p>
              )}
            </div>
            <div className="build-details-section">
              <h3>{detailsCopy.gallery}</h3>
              {images.length ? (
                <div className="build-details-gallery">
                  {images.map((image, imageIndex) => (
                    <button
                      key={`${image}-${imageIndex}`}
                      type="button"
                      aria-label={`${lightboxCopy.title.replace('{name}', name)} — ${imageIndex + 1} / ${images.length}`}
                      onClick={() => setActiveImage(imageIndex)}
                    >
                      <img src={image} alt={`${build.imageAlt} — ${imageIndex + 1} / ${images.length}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="build-details-empty">—</p>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
      {isLightboxOpen && createPortal(
        <div
          className="build-lightbox"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setActiveImage(null)
          }}
        >
          <div
            ref={dialogRef}
            className="build-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxCopy.title.replace('{name}', name)}
          >
            <button
              ref={closeButtonRef}
              className="build-lightbox-close"
              type="button"
              aria-label={lightboxCopy.close}
              onClick={() => setActiveImage(null)}
            >
              ×
            </button>
            {images.length > 1 && (
              <button
                className="build-lightbox-navigation build-lightbox-previous"
                type="button"
                aria-label={lightboxCopy.previous}
                onClick={showPreviousImage}
              >
                ‹
              </button>
            )}
            <img
              className="build-lightbox-image"
              src={images[activeImage]}
              alt={`${build.imageAlt} — ${activeImage + 1} / ${images.length}`}
            />
            {images.length > 1 && (
              <button
                className="build-lightbox-navigation build-lightbox-next"
                type="button"
                aria-label={lightboxCopy.next}
                onClick={showNextImage}
              >
                ›
              </button>
            )}
            {images.length > 1 && (
              <p className="build-lightbox-count" aria-live="polite">
                {activeImage + 1} / {images.length}
              </p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default BuildCard
