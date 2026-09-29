import logo from '../assets/images/cuber-logo.png.png'

function BrandLogo({ className = '' }) {
  return <img className={className} src={logo} alt="CUBER logo" />
}

export default BrandLogo
