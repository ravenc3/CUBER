import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function BuildCard({
  build,
  enquireTemplate,
  specsLabelTemplate,
  moreSpecsTemplate,
  lightboxCopy,
  index,
}) {
  const name = build.name
  const images = build.images?.length ? build.images : build.image ? [build.image] : []
  const [activeImage, setActiveImage] = useState(null)
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const imageButtonRef = useRef(null)
  const isLightboxOpen = activeImage !== null

  useEffect(() => {
    if (!isLightboxOpen) return undefined

    const imageButton = imageButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') setActiveImage(null)
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
      if (images.length > 1 && event.key === 'ArrowRight') {
        setActiveImage((current) => (current + 1) % images.length)
      }
      if (images.length > 1 && event.key === 'ArrowLeft') {
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

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + images.length) % images.length)
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % images.length)
  }

  return (
    <>
      <article className="build-card">
        {build.image ? (
          <button
            ref={imageButtonRef}
            className="build-image-link"
            type="button"
            aria-label={enquireTemplate.replace('{name}', name)}
            onClick={() => setActiveImage(0)}
          >
            <img className="build-image" src={build.image} alt={build.imageAlt} loading="lazy" />
            <span className="build-index">0{index + 1}</span>
            <span className="build-arrow" aria-hidden="true">↗</span>
          </button>
        ) : (
          <div className="build-image-link">
            <span className="build-image-placeholder">{name}</span>
            <span className="build-index">0{index + 1}</span>
          </div>
        )}
        <div className="build-card-copy">
          <p className="build-category">{build.category}</p>
          <h3>{name}</h3>
          <p className="build-description">{build.description}</p>
        </div>
        {build.specs.length > 0 && (
          <ul className="build-specs" aria-label={specsLabelTemplate.replace('{name}', name)}>
            {build.specs.slice(0, 4).map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
        )}
        {build.specs.length > 4 && (
          <details className="build-additional-specs">
            <summary>
              {moreSpecsTemplate.replace('{count}', String(build.specs.length - 4))}
            </summary>
            <ul className="build-specs" aria-label={specsLabelTemplate.replace('{name}', name)}>
              {build.specs.slice(4).map((spec) => <li key={spec}>{spec}</li>)}
            </ul>
          </details>
        )}
      </article>
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
