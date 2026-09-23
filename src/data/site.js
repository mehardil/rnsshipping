export const company = {
  name: 'RNS Shipping',
  legal: 'RNS Shipping LLC',
  tagline: 'Marine Excellence, Delivered.',
  phone: '+971 55 539 6858',
  phoneHref: '+971555396858',
  email: 'info@rnsshipping.com',
  website: 'https://rnsshipping.com',
  experience: 35,
  offices: [
    {
      label: 'Head Office',
      address: '2209, Damac XL Tower, Business Bay, Dubai, UAE',
    },
    {
      label: 'Warehouse',
      address: 'W-341, Dubai Maritime City (DMC), Dubai, UAE',
    },
  ],
  social: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/best-fast-way-sea-shipping-lines-agents-llc/posts/?feedView=all',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/rns_marine?igsh=MTFreWFubThiamNjeg==',
    },
    {
      label: 'WhatsApp',
      href: 'https://api.whatsapp.com/send?phone=971555396858&text=Hi%20RNS%20Shipping%2C%20I%E2%80%99d%20like%20to%20discuss%20how%20your%20services%20can%20support%20our%20vessel%20operations.',
    },
  ],
}

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
]

export const services = [
  {
    slug: 'technical-services',
    num: '01',
    title: 'Technical Servicing',
    short:
      'Comprehensive maintenance and repair solutions carried out by experienced marine engineers and technicians.',
    image: '/images/rns-port-cranes.webp',
    icon: 'wrench',
    intro:
      'Our comprehensive technical servicing ensures your vessel operates at peak performance and reliability. We offer a wide range of maintenance and repair solutions carried out by experienced marine engineers and technicians.',
    items: [
      { name: 'Tank Cleaning', desc: 'Complete cleaning of fuel, bilge and heeling tanks to maintain efficiency and safety standards.' },
      { name: 'Piston Change & Skirt Renewal', desc: 'Expert replacement and refurbishment for enhanced engine performance and longevity.' },
      { name: 'Valve Spindle & Overhauling', desc: 'Precision overhauling and maintenance for smooth, leak-free operation.' },
      { name: 'Motor Rewinding', desc: 'Professional rewinding of electric motors to restore functionality and extend service life.' },
      { name: 'Welding & Fabrication', desc: 'Onboard and workshop welding and fabrication tailored to marine requirements.' },
      { name: 'Steel Product Manufacturing', desc: 'In-house manufacturing of razor wire and other steel products for industrial and marine use.' },
    ],
  },
  {
    slug: 'ship-chandelling',
    num: '02',
    title: 'Ship Chandelling',
    short:
      'Complete ship chandelling solutions with quality, reliable and timely delivery of marine supplies.',
    image: '/images/rns-containers.webp',
    icon: 'ship',
    intro:
      'We provide complete ship chandelling solutions to meet all your vessel’s operational needs, ensuring quality, reliability and timely delivery of marine supplies. Our extensive range covers every aspect of onboard requirements.',
    items: [
      { name: 'Provisions', desc: 'Fresh, frozen and dry food supplies sourced for quality and freshness.' },
      { name: 'Cabin / Galley Stores', desc: 'Full range of housekeeping and kitchen essentials for crew comfort.' },
      { name: 'Safety Equipment', desc: 'Certified safety gear meeting international maritime standards.' },
      { name: 'Deck & Engine Stores', desc: 'Tools, ropes, paints and maintenance materials.' },
      { name: 'Firefighting Equipment', desc: 'Approved fire safety systems and extinguishers for vessel protection.' },
      { name: 'Medical Stores', desc: 'Essential medicines and first aid supplies.' },
      { name: 'Chemicals & Oils', desc: 'High-grade cleaning chemicals, lubricants and maintenance oils.' },
      { name: 'Electrical Supplies', desc: 'Cables, lighting, fittings and electrical components.' },
      { name: 'Navigational Supplies', desc: 'Instruments and accessories for safe, precise navigation.' },
      { name: 'Nautical Publications', desc: 'Updated charts, manuals and maritime documentation.' },
    ],
  },
  {
    slug: 'spare-parts-logistics',
    num: '03',
    title: 'Ship Spare & Logistics',
    short:
      'Efficient worldwide handling and transportation of marine spare parts through air, sea and land.',
    image: '/images/rns-logistics.webp',
    icon: 'logistics',
    intro:
      'We specialise in the efficient handling and transportation of marine spare parts and equipment worldwide. Our logistics network ensures timely, secure and cost-effective delivery through air, sea and land transport.',
    items: [
      { name: 'Air Freight', desc: 'Fast, reliable air transport for urgent ship spare deliveries.' },
      { name: 'Sea Freight', desc: 'Economical, dependable sea shipping solutions for all cargo types.' },
      { name: 'FCL Shipments', desc: 'Full Container Load services for large or dedicated shipments.' },
      { name: 'LCL Shipments', desc: 'Less than Container Load options for smaller or consolidated cargo.' },
      { name: 'Project Logistics', desc: 'End-to-end logistics for complex marine projects.' },
      { name: 'Ship Spare Logistics', desc: 'Dedicated management and movement of spare parts globally.' },
      { name: 'Ship Spare Handling', desc: 'Careful packaging, storage and handling of critical components.' },
      { name: 'Ship Spare Clearance', desc: 'Efficient customs clearance and documentation support.' },
    ],
  },
  {
    slug: 'automation',
    num: '04',
    title: 'Marine Automation',
    short:
      'Advanced automation solutions that enhance vessel efficiency, safety and performance.',
    image: '/images/rns-ship-bow.webp',
    icon: 'automation',
    intro:
      'We deliver advanced marine automation solutions designed to enhance vessel efficiency, safety and performance. Our team provides installation, maintenance and troubleshooting of automated systems critical to ship operations.',
    items: [
      { name: 'Automation', desc: 'Comprehensive automation for vessel operations and monitoring.' },
      { name: 'Boiler Control Systems', desc: 'Precision control systems to optimise boiler performance and safety.' },
      { name: 'Cargo Tanks', desc: 'Automated monitoring and control of cargo tank operations.' },
      { name: 'Cargo Pumps', desc: 'Automation and maintenance of cargo pump systems.' },
      { name: 'Fire Alarm Systems', desc: 'Installation and servicing of integrated fire detection and alarms.' },
      { name: 'Engine Control Systems', desc: 'Automation of engine operations for reduced downtime.' },
      { name: 'Navigation System', desc: 'Supply and integration of modern navigational automation.' },
      { name: 'Temperature Controlled Pumps', desc: 'Automated temperature regulation for sensitive cargo.' },
    ],
  },
]

export const stats = [
  { value: 35, suffix: '+', label: 'Years of Experience' },
  { value: 500, suffix: '+', label: 'Vessels Supported' },
  { value: 24, suffix: '/7', label: 'Operational Support' },
  { value: 100, suffix: '%', label: 'Commitment to Quality' },
]

export const testimonials = [
  {
    quote:
      'We’ve worked with RNS Shipping for several years, and their technical understanding is exceptional. Whether it’s engine overhauls, electrical troubleshooting, or emergency repairs, their technicians deliver reliable results with precision and care. They truly understand the demands of shipboard operations and always deliver on time.',
    name: 'Chief Engineer A. Rahman',
    role: 'MT Sea Legend',
  },
  {
    quote:
      'Our procurement team relies on RNS Shipping for timely supply of marine spares, lubricants, and deck equipment. Their quotations are transparent, pricing is competitive, and communication is smooth from inquiry to delivery. RNS Shipping has become one of our most trusted suppliers in the Gulf region.',
    name: 'Purchase Manager',
    role: 'Elegancia Marine',
  },
  {
    quote:
      'RNS Shipping has proven to be a professional and trustworthy partner. Their coordination with vessel staff and follow-up after service completion are commendable. The company’s commitment to quality workmanship and quick turnaround makes them a preferred service provider for our managed fleet.',
    name: 'Chief Engineer',
    role: 'Maersk Detroit, Maersk Line Limited',
  },
  {
    quote:
      'RNS Shipping has consistently provided outstanding support during our port calls in the UAE. Their team responds promptly to every request — from urgent maker spare parts arranged prior to vessel arrival to on-deck assistance. The professionalism and dedication of their operations staff ensure our vessels remain on schedule without delays. Highly dependable and efficient!',
    name: 'Capt. John Peterson',
    role: 'Master, MV Celestia',
  },
]

export const clients = [
  { name: 'Maersk Line', logo: '/images/client-maersk.png' },
  { name: 'Elegancia Marine', logo: '/images/client-1.png' },
  { name: 'Client Partner', logo: '/images/client-2.png' },
  { name: 'Client Partner', logo: '/images/client-3.png' },
  { name: 'Client Partner', logo: '/images/client-4.png' },
  { name: 'Client Partner', logo: '/images/client-5.png' },
]

export const whyChoose = [
  {
    title: '35+ Years of Seafaring Expertise',
    desc: 'Founded on decades of hands-on marine engineering and technical experience across the Gulf and beyond.',
  },
  {
    title: 'Rapid Response, Round the Clock',
    desc: '24/7 operational support so vessels stay on schedule — no delays, no downtime.',
  },
  {
    title: 'Global Supplier Network',
    desc: 'Trusted makers and suppliers worldwide for Caterpillar, Yanmar and critical engine components.',
  },
  {
    title: 'Transparent & Competitive',
    desc: 'Clear quotations, competitive pricing and smooth communication from inquiry to delivery.',
  },
]

export const certifications = [
  {
    name: 'BQC Assessment',
    desc: 'Quality management assessed and certified to international standards.',
    logo: '/images/certification-bqc.png',
  },
]

export const faqs = [
  {
    q: 'Which locations do you cover for ship repair and tank cleaning?',
    a: 'We operate across the UAE, with core coverage in Jebel Ali, Dubai Maritime City and Khorfakkan, and mobilise to vessels at anchor or alongside across the Gulf region.',
  },
  {
    q: 'How quickly can you mobilise a technical team?',
    a: 'For urgent requirements we mobilise within hours. Our 24/7 operations desk coordinates technicians, spares and logistics so your vessel experiences minimal downtime.',
  },
  {
    q: 'Do you supply Caterpillar and Yanmar spare parts?',
    a: 'Yes. We specialise in Caterpillar and Yanmar spares including injectors and engine parts, sourced through our trusted global logistics network and cleared efficiently for fast turnaround.',
  },
  {
    q: 'Are your services compliant with maritime standards?',
    a: 'All work is carried out to recognised maritime safety and quality standards, and our quality management is independently assessed under BQC Assessment.',
  },
]
