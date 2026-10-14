# Asset sources

## Added photograph
- File: `public/images/harbour-evening.webp` and responsive `harbour-evening-small.webp`
- Photographer: Wolfgang Weiser
- Original: https://unsplash.com/photos/a-cargo-ship-is-docked-at-a-port-4e4MCw9eMaw
- License: https://unsplash.com/license (source page identifies the photograph as free under the Unsplash License)
- Subject: cargo ship in Hamburg, Germany. Used as general maritime imagery, not represented as an RNS-owned vessel or a UAE location.
- Downloaded: 2026-09-25. Resized and WebP encoded by the image provider.

Other images and videos were supplied in the existing project and have been retained. Their original licensing records were not present in the repository.

## Port portrait
- File: `public/images/port-night.webp`
- Photographer: Albert Stoynov
- Original: https://unsplash.com/photos/container-ship-and-cranes-at-a-busy-shipping-port-oL3wEM0JEwQ
- License: https://unsplash.com/license
- Subject: Port of Vancouver at night. Used as general global maritime imagery, not as a photograph of a UAE port or RNS facilities.
- Downloaded: 2026-09-25. Cropped to 1000 x 1100 and WebP encoded by the image provider.

## Delivery optimizations and fonts
- `ship-technical-optimized.webp` and `technical-gear-optimized.webp` are compressed copies of the supplied images. Originals are retained.
- Montserrat and Roboto are the original site typefaces, now self-hosted from Google Fonts to remove external render-blocking requests. Their SIL Open Font Licenses are included in `public/fonts/`.

## Replacement marine engineering photography
- `public/images/marine-engine-room.webp`: iSawRed, "Various pipes on the engine room."
  - Source: https://unsplash.com/photos/a-large-machine-with-pipes-WB9HyqF8lKA
  - Delivered as a 1400px-wide WebP by the image provider.
- `public/images/marine-control-room.webp`: Dmitrijs Safrans, ship engine control room.
  - Source: https://unsplash.com/photos/a-control-room-filled-with-lots-of-electronic-equipment-2CakbXfm_gM
  - Delivered as a 1100px-wide WebP by the image provider.
- Both source pages identify these photos as free under https://unsplash.com/license.
- Downloaded 2026-09-30. Used as illustrative maritime photography, not identified as RNS personnel, vessels or facilities.
- Replaces the previously supplied technician/gear imagery in visible sections, service data and social previews; old files are retained.

## Hero clarity update
- Added 2400px versions of the same credited engineering photos as `marine-engine-room-hero.webp` and `marine-control-room-hero.webp`; obtained from the image provider at quality 88 for full-width heroes.
- Chandelling and logistics guide heroes use the existing 1920px `rns-ship-hero.webp` and `rns-ship-dramatic.webp` instead of enlarging small card images. Card imagery is retained.
