import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { Icon } from '../components/Icons'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The page you are looking for could not be found. Return to RNS Shipping home."
        path="/404"
        noindex
      />
      <section className="page-hero" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <div className="container center">
          <span className="eyebrow eyebrow--center">404</span>
          <h1>Charting Unfamiliar Waters</h1>
          <p className="lead" style={{ margin: '0 auto 30px' }}>
            The page you’re looking for has drifted off course. Let’s get you back to port.
          </p>
          <Link to="/" className="btn btn--accent">
            Back to Home
            <Icon name="arrow" size={18} className="btn__arrow" />
          </Link>
        </div>
      </section>
    </>
  )
}
