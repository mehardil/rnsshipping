import { clients } from '../data/site'

export default function ClientMarquee() {
  const row = [...clients, ...clients]
  return (
    <div className="marquee">
      <div className="flex w-max animate-slide gap-4 hover:[animation-play-state:paused]">
        {row.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className="grid h-[104px] min-w-[200px] place-items-center rounded-2xl border border-line bg-white px-8"
          >
            <img
              src={c.logo}
              alt={`${c.name} logo`}
              loading="lazy"
              className="max-h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
