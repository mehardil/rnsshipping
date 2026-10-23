import { useEffect, useState } from 'react'
import { Icon } from './Icons'

export default function ShareButtons({ title, url, compact = false }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2200)
    return () => clearTimeout(timer)
  }, [copied])

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`share-buttons ${compact ? 'share-buttons--compact' : ''}`}>
      <span className="share-buttons__label">Share</span>
      <a href={linkedIn} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><Icon name="linkedin" size={17} /></a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><Icon name="whatsapp" size={17} /></a>
      <button type="button" onClick={copy} aria-live="polite" aria-label="Copy article link">
        <Icon name={copied ? 'check' : 'link'} size={17} />
        {!compact && <span>{copied ? 'Copied' : 'Copy link'}</span>}
      </button>
    </div>
  )
}
