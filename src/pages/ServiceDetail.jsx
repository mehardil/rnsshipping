import { Link, useParams } from 'react-router-dom'
import { services } from '../data/site'
import { serviceGuides } from '../data/serviceGuides'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Icon } from '../components/Icons'
import NotFound from './NotFound'

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = services.find(item => item.slug === slug)
  const guide = serviceGuides[slug]
  if (!service || !guide) return <NotFound />
  return <>
    <Seo title={guide.heading} description={guide.description} path={`/services/${slug}`} image={guide.image} jsonLd={{ '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.intro, serviceType: service.title, areaServed: { '@type': 'Country', name: 'United Arab Emirates' }, provider: { '@id': 'https://rnsshipping.com/#organization' }, url: `https://rnsshipping.com/services/${slug}` }} />
    <section className="page-hero service-hero">
      <img className="page-hero__photo" src={guide.image} alt="" width="1400" height="900" fetchpriority="high" />
      <div className="page-hero__overlay" />
      <div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/services">Services</Link><span>/</span><span aria-current="page">{service.title}</span></nav><h1>{guide.heading}</h1><p className="lead">{service.intro}</p><Link to={`/contact?service=${encodeURIComponent(service.title)}`} className="btn btn--accent">Discuss your requirement <Icon name="arrow" size={18} /></Link></div>
    </section>
    <section className="section"><div className="container service-article">
      <div className="service-article__body"><Reveal><h2>{service.title}, built around your vessel.</h2><p className="lead">{guide.overview}</p></Reveal>
        {guide.sections.map(([title,body]) => <Reveal key={title}><section className="service-article__section"><h2>{title}</h2><p>{body}</p></section></Reveal>)}
        <section className="service-article__section"><h2>Our service scope</h2><ul className="service-scope">{service.items.map(item => <li key={item.name}><Icon name="check" size={18}/><div><h3>{item.name}</h3><p>{item.desc}</p></div></li>)}</ul></section>
      </div>
      <aside className="enquiry-aside"><span className="enquiry-aside__icon"><Icon name={service.icon} size={30} /></span><h2>Make your enquiry count.</h2><p>Include these details to help our operations team understand your requirement.</p><ul>{guide.checklist.map(item=><li key={item}><Icon name="check" size={16}/>{item}</li>)}</ul><Link className="btn btn--primary" to={`/contact?service=${encodeURIComponent(service.title)}`}>Request a quotation <Icon name="arrow" size={18}/></Link><a className="text-link" href="tel:+971555396858">Call +971 55 539 6858</a></aside>
    </div></section>
    <section className="section section--tint"><div className="container service-faq"><h2>Your questions, answered.</h2><div>{guide.faqs.map(([q,a])=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
    <section className="section"><div className="container"><div className="section-head"><h2>Connected marine expertise.</h2><p>Explore the other ways RNS Shipping can support your vessel.</p></div><div className="related-services">{services.filter(s=>s.slug!==slug).map(s=><Link key={s.slug} to={`/services/${s.slug}`}><Icon name={s.icon} size={24}/><h3>{s.title}</h3><Icon name="arrow" size={20}/></Link>)}</div></div></section>
  </>
}
