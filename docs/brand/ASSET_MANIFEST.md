# Current asset manifest

Updated 2026-10-20 for the simplified storefront. All runtime assets are local in `packages/storefront-ui/assets/`.

| File | Source and use |
| --- | --- |
| `smile-dog-shirt.png`, `tung-tung-tapes-shirt.png`, `captain-clark-shirt.png` | Built-in imagegen garment mockups based on the user-supplied character references; text-free distressed prints on washed-black tees. |
| `smile-dog-art.png`, `tung-tung-tapes-art.png`, `captain-clark-art.png` | Corresponding transparent character graphics, generated and revised with built-in imagegen. Design concepts, not print-separated production artwork. |
| `oswald.ttf`, `OSWALD-LICENSE.txt` | [Google Fonts Oswald](https://github.com/google/fonts/tree/main/ofl/oswald), SIL Open Font License; wordmark only. |
| `tinos-regular.ttf`, `TINOS-LICENSE.txt` | [Google Fonts Tinos](https://github.com/google/fonts/tree/main/ofl/tinos) and [upstream license](https://github.com/googlefonts/tinos/blob/3b4482a99b80ea5fc75f187b1be3120a3f5905b3/OFL.txt); serif interface type. |
| `icon.svg` | Existing simple geometric V favicon. |
| `signal.svg` | Legacy geometric SVG; unused by the demo. |

Earlier generated background images and Bodoni fonts were removed from the package and build. The current merchandise artwork was generated from user-provided character references. No Isolation Man artwork is copied. Historical research, prompts, and evidence in this documentation folder describe an earlier direction and are not part of the deployed site.

The current font direction is Oswald for VULGAR and a traditional serif matching the user’s screenshot for everything else. Pixelify Sans was removed. The updated art direction permits AI-generated shirt designs and garment mockups only. User-provided references are retained locally in `docs/brand/references/`, outside the runtime assets. The completed artwork pass and exact generation/revision prompts are recorded in `SHIRT_DESIGNS.md`.
