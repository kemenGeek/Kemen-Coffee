# KEMEN COFFEE

**Brewed with Passion. Served with Purpose.**

A premium, responsive, single-page marketing website for KEMEN COFFEE, a fictional coffee house brand. It is a static front-end showcase focused on visual design, typography, and smooth interaction.

There is no backend, database, authentication, API, payment processing, or real ordering. All content is stored locally in the project, and menu items, prices, reviews, and contact details are sample content.

## Features

- Sticky navigation that turns solid on scroll, with active section indicators and smooth anchor scrolling
- Full-screen mobile navigation with focus handling and scroll lock
- Hero with editorial typography and a scroll indicator
- Cinematic background that crossfades to a different scene when a navigation link is clicked, and is never driven by scrolling
- Six-item signature menu with category filters that run on local data
- Editorial Experience section with subtle image parallax
- Masonry-inspired gallery with a lightbox supporting keyboard and swipe navigation
- Testimonials clearly labelled as demo content
- UI-only contact form with validation and a demo notification; nothing is sent or stored
- Back-to-top button and placeholder social links

### Accessibility

- Semantic HTML with a skip link and visible keyboard focus states
- Focus trapping in dialogs, with focus returned on close
- Meaningful image alt text
- `prefers-reduced-motion` support that disables smooth scrolling, parallax, and looping animation, and shows still frames instead of background video
- Responsive layouts for desktop, laptop, tablet, and mobile

## Tech Stack

| Tool | Purpose |
| --- | --- |
| React and TypeScript | Components and type safety |
| Vite | Development server and production build |
| Tailwind CSS | Styling and design tokens |
| Motion for React | Animation |
| Lucide React | Interface icons |
| Google Fonts | Fraunces and Manrope typefaces |

## Getting Started

You need [Node.js](https://nodejs.org/) 20.19 or newer, or 22.12 or newer.

```bash
npm install
npm run dev
```

Vite prints the local address when it starts, usually <http://localhost:5173>.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Project Structure

```text
public/             Favicon
src/
  assets/images/    Optimized local WebP photography
  assets/scenes/    Background video loops and their posters
  components/       Reusable UI components
  data/             Hardcoded site content
  hooks/            Reusable React hooks
  lib/              Small shared helpers
  sections/         Page sections
  styles/           Tailwind theme and global styles
  App.tsx           Page composition
  main.tsx          Application entry point
  types.ts          Shared TypeScript types
```

To change copy, prices, or images, edit the files in `src/data/`. Brand colors, fonts, and shadows are defined in `src/styles/index.css`.

## Photography

Photos are stored locally in several sizes. They are stock images used as sample content and do not show a real KEMEN COFFEE location.

| Asset | Used in | Source |
| --- | --- | --- |
| `about-barista` | About | [Unsplash](https://unsplash.com/photos/2z3MOB3kfJU) |
| `menu-signature-latte` | Kemen Signature Latte | [Unsplash](https://images.unsplash.com/photo-1572442388796-11668a67e53d) |
| `menu-spanish-latte` | Spanish Latte | [Unsplash](https://images.unsplash.com/photo-1517701604599-bb29b565090c) |
| `menu-caramel-macchiato` | Caramel Macchiato | [Unsplash](https://images.unsplash.com/photo-1461023058943-07fcbe16d735) |
| `menu-americano` | Classic Americano | [Unsplash](https://images.unsplash.com/photo-1521302080334-4bebac2763a6) |
| `menu-matcha` | Iced Matcha Latte | [Unsplash](https://unsplash.com/photos/VKWjhlgFFwc) |
| `exp-atmosphere` | Experience | [Unsplash](https://images.unsplash.com/photo-1521017432531-fbd92d768814) |
| `exp-ingredients` | Experience | [Unsplash](https://images.unsplash.com/photo-1511920170033-f8396924c348) |
| `exp-crafted` | Experience | [Unsplash](https://images.unsplash.com/photo-1497935586351-b67a49e012bf) |
| `exp-memorable` | Experience | [Unsplash](https://images.unsplash.com/photo-1495474472287-4d71bcdd2085) |
| `gallery-lattes` | Gallery | [Unsplash](https://images.unsplash.com/photo-1507133750040-4a8f57021571) |
| `gallery-garden-cafe` | Gallery | [Unsplash](https://images.unsplash.com/photo-1600093463592-8e36ae95ef56) |
| `gallery-steam` | Gallery | [Unsplash](https://images.unsplash.com/photo-1518057111178-44a106bad636) |
| `gallery-counter` | Gallery | [Unsplash](https://images.unsplash.com/photo-1453614512568-c4024d13c247) |
| `gallery-beans` | Gallery | [Unsplash](https://images.unsplash.com/photo-1559525839-b184a4d698c7) |
| `gallery-ring` | Gallery | [Unsplash](https://images.unsplash.com/photo-1498804103079-a6351b050096) |
| `gallery-pour` | Gallery | [Unsplash](https://images.unsplash.com/photo-1541167760496-1628856ab772) |
| `gallery-latte-table` | Gallery | [Unsplash](https://images.unsplash.com/photo-1534778101976-62847782c213) |
| `gallery-window` | Gallery | [Unsplash](https://images.unsplash.com/photo-1445116572660-236099ec97a0) |
| `menu-mocha` | Mocha Espresso | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mocha_-_Garden_Caf%C3%A9_Brighton_2023-12-30.jpg), by Andy Li, CC0 |

Unsplash images are used under the [Unsplash License](https://unsplash.com/license).

## Background Video

Each navigation link has its own background scene, defined in `src/data/scenes.ts`. Clicking a link changes the scene, and scrolling never does. Four scenes are short silent video loops, and the Gallery scene is a slow composition of the site's own photographs.

| Scene | Asset | Source |
| --- | --- | --- |
| Home | `home.mp4` | [Mixkit](https://mixkit.co/free-stock-video/demonstration-video-of-a-steaming-cup-of-coffee-43935/) |
| About | `about.mp4` | [Mixkit](https://mixkit.co/free-stock-video/customers-in-a-minimalist-style-restaurant-4385/) |
| Menu | `menu.mp4` | [Mixkit](https://mixkit.co/free-stock-video/filling-a-white-cup-of-coffee-236/) |
| Contact | `contact.mp4` | [Mixkit](https://mixkit.co/free-stock-video/woman-drinking-coffee-in-a-cafe-223/) |

The clips are trimmed, cropped, and re-encoded so they loop cleanly. They are used under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree), and they do not show a real KEMEN COFFEE location.

## Before Going Live

Replace the sample menu, prices, testimonials, and contact details, add the real social media links, and swap in your own photography and video.
