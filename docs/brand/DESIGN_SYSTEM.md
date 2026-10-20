# VULGAR visual system

Updated 2026-10-20 following feedback: AI art only for shirts/mockups, no large headings, less text, and a simple shop inspired by the structure of [Isolation Man](https://www.isolationman.net/products).

The homepage is a three-product grid below a compact centered wordmark. Navigation contains All Pieces, Collections, About, and Bag. The footer contains only the creator links. There is no hero, giant wordmark, campaign image, editorial section, or sales slogan.

## Typography and color

The VULGAR wordmark uses Oswald at weight 500. All other interface text uses Tinos, a traditional serif chosen from the supplied “New Pixel” screenshot. Both fonts are bundled locally with SIL Open Font License notices. Product titles are 14–16px, page headings 18–24px, secondary text 11–13px, and the wordmark 24–32px. There are no pixel or monospace typefaces in the current design.

Tokens: background `#080808`, surface `#101010`, text `#dedede`, muted text `#939393`, dividers `#292929`. Page gutters are `clamp(20px, 5vw, 64px)`.

## Layout and behavior

The catalog uses three columns above 680px and two below. Product details stack at 680px; the cart stacks at 900px. Navigation becomes a disclosure at 480px, with Escape dismissal and keyboard focus support. Controls retain visible focus, native disabled states, status announcements, and reduced-motion support.

The Creepypasta Collection contains Smile Dog, Russian Sleep Experiment, and Captain Clark. Collections lists it under Available collections, followed by The SCP Collection and The Tung Tung Tapes Collection under Previous collections. Both previous collections are marked Unavailable; their detail pages contain no purchasable products. About contains only “Reality is darker than fiction.” and the placeholder address `contact@vulgar.example`. Their image areas remain text-only placeholders until the next Astra shirt-design task. AI-generated shirt graphics and garment mockups are permitted; decorative site illustrations and AI backgrounds are excluded. Demo prices, sizes, and availability support testing; they do not represent actual inventory. Checkout stays disabled.
