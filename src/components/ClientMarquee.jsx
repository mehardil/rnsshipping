import { clients } from '../data/site'

export default function ClientMarquee() {
  const row = [...clients, ...clients]
  return (
    <div className="marquee">
      <div className="flex w-max animate-slide gap-5 hover:[animation-play-state:paused]">
        {row.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className="relative grid h-[136px] min-w-[240px] place-items-center rounded-3xl border border-line bg-white px-10 transition duration-300 ease-out hover:z-10 hover:scale-110 hover:border-accent hover:shadow-card"
          >
            <img
              src={c.logo}
              alt={`${c.name} logo`}
              loading="lazy"
              className="max-h-16 w-auto object-contain transition duration-300 ease-out"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
