import { Link } from 'react-router-dom'

export function slugifyHeading(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createHeadingIds() {
  const seen = new Map()
  return (text) => {
    const base = slugifyHeading(text) || 'section'
    const count = (seen.get(base) || 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }
}

export function extractHeadings(markdown) {
  const ids = createHeadingIds()
  const headings = []
  String(markdown || '').split('\n').forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) return
    const text = stripInline(match[2])
    headings.push({ level: match[1].length, text, id: ids(text) })
  })
  return headings
}

function stripInline(value) {
  return String(value)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
}

function safeHref(href) {
  const value = String(href || '').trim()
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value
  if (value.startsWith('/') || value.startsWith('#')) return value
  return null
}

function inline(text, keyPrefix) {
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const parts = String(text).split(pattern).filter(part => part !== '')
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const href = safeHref(link[2])
      if (!href) return <span key={key}>{link[1]}</span>
      if (href.startsWith('/') || href.startsWith('#')) return <Link key={key} to={href}>{link[1]}</Link>
      return <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link[1]}</a>
    }
    return <span key={key}>{part}</span>
  })
}

function parseTableRow(line) {
  return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim())
}

function isTableSeparator(line) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim())
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  const nextId = createHeadingIds()
  let index = 0
  let key = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^```/.test(line.trim())) {
      const code = []
      index += 1
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index])
        index += 1
      }
      index += 1
      blocks.push(<pre key={`code-${key++}`}><code>{code.join('\n')}</code></pre>)
      continue
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/)
    if (heading) {
      const text = stripInline(heading[2])
      const id = nextId(text)
      const Tag = `h${heading[1].length}`
      blocks.push(<Tag key={`h-${key++}`} id={id}>{inline(heading[2], `h-${key}`)}</Tag>)
      index += 1
      continue
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${key++}`} />)
      index += 1
      continue
    }

    const image = line.trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/)
    if (image) {
      blocks.push(
        <figure key={`figure-${key++}`} className="article-figure">
          <img src={image[2]} alt={image[1]} loading="lazy" decoding="async" />
          {image[3] ? <figcaption>{image[3]}</figcaption> : null}
        </figure>
      )
      index += 1
      continue
    }

    if (line.trim().startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const header = parseTableRow(line)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[index]))
        index += 1
      }
      blocks.push(
        <div className="article-table-wrap" key={`table-${key++}`}>
          <table>
            <thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}>{inline(cell, `th-${key}-${cellIndex}`)}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell, `td-${key}-${rowIndex}-${cellIndex}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line)
      const items = []
      while (index < lines.length && (/^\s*[-*]\s+/.test(lines[index]) || /^\s*\d+\.\s+/.test(lines[index]))) {
        items.push(lines[index].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))
        index += 1
      }
      const ListTag = ordered ? 'ol' : 'ul'
      blocks.push(
        <ListTag key={`list-${key++}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `li-${key}-${itemIndex}`)}</li>)}
        </ListTag>
      )
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const quote = []
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''))
        index += 1
      }
      blocks.push(
        <blockquote key={`quote-${key++}`}>
          {quote.map((item, quoteIndex) => <p key={quoteIndex}>{inline(item, `quote-${key}-${quoteIndex}`)}</p>)}
        </blockquote>
      )
      continue
    }

    const paragraph = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{2,4})\s+/.test(lines[index]) &&
      !/^```/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^---+\s*$/.test(lines[index]) &&
      !/^\s*!\[[^\]]*\]\(/.test(lines[index]) &&
      !/^\s*\|/.test(lines[index])
    ) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push(<p key={`p-${key++}`}>{inline(paragraph.join(' '), `p-${key}`)}</p>)
  }

  return blocks
}
