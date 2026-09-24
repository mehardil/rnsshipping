import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { Icon } from './Icons'

const ports = [
  ['Jebel Ali', 'Plan ship repairs, tank cleaning and marine supplies around your port call in Jebel Ali. Share your berth or anchorage, vessel particulars and available working window.'],
  ['Dubai Maritime City', 'Coordinate technical servicing, chandelling and spare parts requirements with our Dubai Maritime City warehouse and Dubai operations team.'],
  ['Khorfakkan', 'Discuss technical attendance and vessel supply requirements for calls at Khorfakkan. Confirm your ETA, local agent and access arrangements when enquiring.'],
]
export default function PortSupport() {
  return <section className="section port-support">
    <div className="container">
      <div className="port-support__heading"><h2>Local knowledge.<br /><em>Worldwide perspective.</em></h2><p>Marine services in Dubai, Jebel Ali and Khorfakkan, connected to a global network of makers, suppliers and logistics partners.</p></div>
      <div className="port-support__grid">
        <Reveal className="port-support__image"><img src="/images/port-night.webp" alt="Container vessel and illuminated port cranes at night" width="1000" height="1100" loading="lazy" /><span>Maritime trade · Global connections</span></Reveal>
        <div className="port-support__ports">{ports.map(([name, description]) => <Reveal key={name}><article><h3>{name}</h3><p>{description}</p><Link className="text-link" to="/contact">Discuss your port call <Icon name="arrow" size={18} /></Link></article></Reveal>)}</div>
      </div>
      <div className="enquiry-process"><h3>A clear path from enquiry to attendance.</h3><ol>{[
        ['Share the requirement', 'Send the vessel name, port, ETA and the work scope or supply list. Photos, part numbers and drawings help clarify the request.'],
        ['Confirm the scope', 'Discuss availability, specifications, delivery arrangements and a quotation with the operations team.'],
        ['Coordinate the port call', 'Agree access, timing and a vessel contact so the people, parts and supplies can be coordinated with your schedule.'],
      ].map(([title, body],i) => <li key={title}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{title}</h4><p>{body}</p></div></li>)}</ol></div>
    </div>
  </section>
}
