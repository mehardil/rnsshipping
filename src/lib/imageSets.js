const widthList = [640, 960, 1440, 1920]

function makeSet(base, width, height) {
  return {
    src: `${base}-${widthList[widthList.length - 1]}.webp`,
    srcSet: widthList.map(w => `${base}-${w}.webp ${w}w`).join(', '),
    width,
    height,
  }
}

const HERO_IMAGES = {
  '/images/marine-engine-room-hero.webp': makeSet('/images/marine-engine-room-hero', 1920, 1198),
  '/images/marine-control-room-hero.webp': makeSet('/images/marine-control-room-hero', 1920, 1440),
  '/images/rns-ship-dramatic.webp': makeSet('/images/rns-ship-dramatic', 1920, 940),
  '/images/rns-ship-hero.webp': makeSet('/images/rns-ship-hero', 1920, 1020),
}

const FALLBACKS = {
  '/images/rns-ship-bow.webp': { src: '/images/rns-ship-bow.webp', width: 1192, height: 476 },
}

export function heroImageSet(src) {
  return HERO_IMAGES[src] || FALLBACKS[src] || { src, width: 1400, height: 900 }
}
