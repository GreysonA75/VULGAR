# VULGAR visual system

Updated 2026-10-20 following feedback: no AI art, no large headings, less text, and a simple shop inspired by the structure of [Isolation Man](https://www.isolationman.net/products).

The homepage is a three-product grid below a compact centered wordmark. Navigation contains Shop, About, and Bag. The footer contains a short demo notice and the creator links. There is no hero, giant wordmark, campaign image, editorial section, or sales slogan.

## Typography and color

Pixelify Sans is bundled locally under the SIL Open Font License. It is the interim pixel-style font; licensed Neue Pixel/Ghosttech webfonts were not provided. Product titles are 14–16px, page headings 18–24px, and the wordmark 24–32px. Body copy uses Arial/Helvetica; prices and small metadata use Courier New.

Tokens: background `#080808`, surface `#101010`, text `#dedede`, muted text `#939393`, dividers `#292929`. Page gutters are `clamp(20px, 5vw, 64px)`.

## Layout and behavior

The catalog uses three columns above 680px and two below. Product details stack at 680px; the cart stacks at 900px. Navigation becomes a disclosure at 480px, with Escape dismissal and keyboard focus support. Controls retain visible focus, native disabled states, status announcements, and reduced-motion support.

The three concepts are Smile Dog, Russian Sleep Experiment, and Captain Clark. Their image areas are text-only placeholders. Demo prices, sizes, and availability support testing; they do not represent actual inventory. Checkout stays disabled.
