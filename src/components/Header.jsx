import { useState } from 'react'
import BrandLogo from './BrandLogo.jsx'

function Header({ language, onLanguageChange, copy }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <a className="brand-link" href="#top" aria-label={copy.home} onClick={closeMenu}>
        <BrandLogo className="brand-logo brand-logo-header" />
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? copy.menuClose : copy.menuOpen}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
      <nav
        className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
        id="primary-navigation"
        aria-label={copy.ariaLabel}
      >
        <a href="#builds" onClick={closeMenu}>{copy.selectedBuilds}</a>
        <a href="#workshop" onClick={closeMenu}>{copy.workshop}</a>
        <a href="#services" onClick={closeMenu}>{copy.services}</a>
        <a href="#about" onClick={closeMenu}>{copy.standard}</a>
        <a className="nav-contact" href="#contact" onClick={closeMenu}>
          {copy.startBuild} <span aria-hidden="true">↗</span>
        </a>
        <div className="language-switcher" role="group" aria-label={copy.language}>
          {['tr', 'en', 'ar'].map((option) => (
            <button
              className={language === option ? 'is-active' : ''}
              key={option}
              type="button"
              aria-pressed={language === option}
              onClick={() => onLanguageChange(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
