# Axton Living

Modern website for [Axton Living Ltd](https://github.com/4Sighteducation/axtonliving) — property investment across the North West and North East.

Built with [Astro](https://astro.build) and deployed on Vercel.

## Pages

- **Home** (`/`) — Hero, services preview, before/after gallery, social feeds placeholder, contact
- **Our Story** (`/about`) — Founder story, values, call to action
- **Services** (`/services`) — Service details, investor section, process steps
- **Feedback form** (`/feedback.html`) — Client review form for Catherine to approve/amend/replace each element

## Brand

- Pink: `#fbdade`
- Green: `#14462e`
- Fonts: Cormorant Garamond (headings), Outfit (body)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Deploy

Push to `main` on GitHub — Vercel auto-deploys from `4Sighteducation/axtonliving`.

## Client feedback

Share `/feedback.html` with the client to collect structured review feedback (Approve / Amend / Replace per element).

- **Auto-save** — progress is saved to the browser's local storage as the client fills in the form
- **Email delivery** — submissions are sent automatically via SendGrid when the client clicks Submit

### SendGrid setup (Vercel)

Add these environment variables in **Vercel → Project → Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `SENDGRID_API_KEY` | Your SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Verified sender address in SendGrid (e.g. `noreply@4site.dev`) |
| `FEEDBACK_TO_EMAIL` | Where feedback is delivered (defaults to `tony@4site.dev`) |

See `.env.example` for reference.
