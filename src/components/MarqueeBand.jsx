export default function MarqueeBand({ items = [] }) {
  const row = [...items, ...items]

  return (
    <section className="marquee-band" aria-hidden="true">
      <div className="marquee-band__track">
        {row.map((t, i) => (
          <span className="marquee-band__item" key={`${t}-${i}`}>
            {t}
            <i className="marquee-band__dot" />
          </span>
        ))}
      </div>
    </section>
  )
}
