import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import About from './sections/About.jsx'
import Contact from './sections/Contact.jsx'
import FeaturedBuilds from './sections/FeaturedBuilds.jsx'
import Hero from './sections/Hero.jsx'
import Process from './sections/Process.jsx'
import Services from './sections/Services.jsx'
import Workshop from './sections/Workshop.jsx'
import translations from './data/translations.js'
import AdminApp from './admin/AdminApp.jsx'
import './App.css'

function App() {
  const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin'
  return isAdminRoute ? <AdminApp /> : <PublicSite />
}

function PublicSite() {
  const [language, setLanguage] = useState('tr')
  const copy = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.title = copy.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', copy.meta.description)
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', copy.meta.title)
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', copy.meta.description)
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', { tr: 'tr_TR', en: 'en_US', ar: 'ar_AR' }[language])
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute('content', copy.meta.title)
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', copy.meta.description)
  }, [copy, language])

  return (
    <>
      <Header
        language={language}
        onLanguageChange={setLanguage}
        copy={copy.navigation}
      />
      <main>
        <Hero copy={copy.hero} />
        <FeaturedBuilds copy={copy.selectedBuilds} language={language} />
        <Workshop copy={copy.workshop} />
        <Services copy={copy.services} />
        <Process copy={copy.process} />
        <About copy={copy.about} />
        <Contact copy={copy.contact} />
      </main>
      <Footer copy={copy.footer} />
    </>
  )
}

export default App
