# BorrowBox - Community Lending Platform

BorrowBox is a full-stack neighbourhood lending marketplace. Members list the tools, gear and
equipment they already own, neighbours request them for a set of dates, and both sides build
reputation through reviews after a successful return.

The repository contains a production-shaped Express API with JSON persistence and a React single
page application built on Tailwind CSS, Lucide icons and Recharts.

---

## Table of contents

1. [Feature overview](#feature-overview)
2. [Architecture](#architecture)
3. [Tech stack](#tech-stack)
4. [Quick start](#quick-start)
5. [Environment variables](#environment-variables)
6. [Demo accounts](#demo-accounts)
7. [API surface](#api-surface)
8. [Security model](#security-model)
9. [Design system](#design-system)
10. [Project structure](#project-structure)
11. [Scripts](#scripts)
12. [License](#license)

---

## Feature overview

**Members and accounts**

- Email and password registration with password strength rules
- JWT sessions (HS256, 7 day expiry, issuer checked on every request)
- Role based access control: `user` and `admin`
- Public member profiles with rating, lending history and reviews
- Self-service profile editing: name, bio, neighbourhood and avatar
- Password change with current-password confirmation

**Listings**

- Create, edit, pause and delete listings
- Categories with real icon keys (no glyph characters stored in data)
- Condition, replacement value and optional per-day lending fee
- Up to six photos per listing with a generated cover
- Search, filtering by category, condition, availability and value range, plus sorting and pagination

**Borrowing workflow**

```
pending -> approved -> borrowed -> returned -> completed
pending -> rejected
pending/approved -> cancelled
borrowed -> overdue -> returned
```

- Date and message validation before a request is sent
- Owner notifications for new requests, reviews and status changes
- Role aware transitions: only owners can approve or hand over, only borrowers can return or cancel
- Item availability updates automatically as the request progresses

**Discovery and engagement**

- Featured listings on the home page
- Wishlist with idempotent add/remove
- In-app notifications with read tracking
- Borrow history with a review flow after completion
- Private member-to-member messaging with per-item threads and unread counts
- Dashboard with activity chart, pending requests, top performing items and reputation

**Interface**

- Responsive marketing site with hero, categories, featured items, how-it-works, trust, impact,
  testimonials and FAQ sections
- Light and dark themes with system preference detection
- Route level code splitting and accessible, keyboard friendly components
- Custom brand mark and favicon rendered from inline SVG

---

## Architecture

```
frontend (React + Vite, port 5173)
        |
        |  /api/*  (relative requests, proxied by Vite in development)
        v
backend (Express, port 5000)
        |
        v
data/db.json (atomic JSON persistence, auto-seeded on first run)
```

The browser always calls the API through a relative `/api` path. In development the Vite dev server
proxies those calls to the Express server, which keeps the app working behind proxies and inside
embedded previews without exposing internal ports.

---

## Tech stack

| Layer      | Technology                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| Frontend   | React 18, Vite 5, React Router 6, Tailwind CSS 3, Framer Motion, Recharts, Lucide, Sonner |
| Backend    | Node.js, Express 4, Joi validation, jsonwebtoken, bcryptjs, helmet, express-rate-limit, morgan, Multer, Swagger UI |
| Persistence| JSON file storage with in-memory caching                                     |

No external database is required. The API seeds demo data the first time it starts.

---

## Quick start

Requirements: Node.js 18 or newer.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # optional, sensible defaults apply
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env          # optional
npm run dev                   # http://localhost:5173
```

Useful URLs:

| URL                                  | Description               |
| ------------------------------------ | ------------------------- |
| `http://localhost:5173`              | Web application           |
| `http://localhost:5000/api/health`   | API health check          |
| `http://localhost:5000/api-docs`     | Swagger UI documentation  |
| `http://localhost:5000/api-docs.json`| OpenAPI document          |

To start from a clean demo database run `npm run seed` inside `backend/`, or delete
`backend/data/db.json` and restart the server; the file is regenerated on boot.

---

## Environment variables

### backend/.env

| Variable               | Default             | Purpose                                                        |
| ---------------------- | ------------------- | -------------------------------------------------------------- |
| `PORT`                 | `5000`              | HTTP port                                                      |
| `HOST`                 | `0.0.0.0`           | Bind address                                                   |
| `NODE_ENV`             | `development`       | Enables strict logging, CORS and error behaviour in production  |
| `JWT_SECRET`           | dev fallback        | Signing secret, required and 32+ characters in production       |
| `API_ALLOWED_ORIGINS`  | empty               | Extra comma separated origins allowed by CORS                   |
| `DB_PATH`              | `backend/data/db.json` | Alternative storage location                                 |

### frontend/.env

| Variable       | Default | Purpose                                                            |
| -------------- | ------- | ------------------------------------------------------------------ |
| `VITE_API_URL` | `/api`  | API base URL. Keep it relative so proxies and previews keep working |

---

## Demo accounts

The seed data creates four members. Credentials are development fixtures only; change them before
exposing the API publicly.

| Role   | Email                 | Password    | Notes                                  |
| ------ | --------------------- | ----------- | -------------------------------------- |
| Admin  | `user1@borrowbox.com` | `Admin@123` | Moderation endpoints and verification  |
| Member | `user2@borrowbox.com` | `Demo@123`  | Owns several listings and requests     |
| Member | `user3@borrowbox.com` | `User@123`  | Camera gear and books                  |
| Member | `user4@borrowbox.com` | `User@123`  | Outdoor equipment                      |

The sign-in screen can autofill the first two accounts, and `GET /api/auth/demo-accounts` returns
the same list.

---

## API surface

All endpoints are documented interactively at `/api-docs`. Summary:

| Module          | Endpoints                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------ |
| Auth            | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/demo-accounts` |
| Users           | `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/profile/update`, `PUT /api/users/profile/password`, `PUT /api/users/:id/verify` |
| Categories      | `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `DELETE /api/categories/:id` |
| Items           | `GET /api/items`, `GET /api/items/featured`, `GET /api/items/my-items`, `GET|POST|PUT|DELETE /api/items/:id` |
| Borrow requests | `GET /api/borrow-requests`, `GET /api/borrow-requests/:id`, `POST /api/borrow-requests`, `PUT /api/borrow-requests/:id/status`, `DELETE /api/borrow-requests/:id` |
| Reviews         | `GET /api/reviews`, `POST /api/reviews`, `DELETE /api/reviews/:id`                          |
| Notifications   | `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`, `DELETE /api/notifications/:id` |
| Wishlist        | `GET /api/wishlist`, `POST /api/wishlist/:itemId`, `DELETE /api/wishlist/:itemId`, `GET /api/wishlist/check/:itemId` |
| Messages        | `GET /api/messages/conversations`, `GET /api/messages/:conversationId`, `POST /api/messages` |
| Dashboard       | `GET /api/dashboard/stats`, `GET /api/dashboard/admin`                                      |
| Health          | `GET /api/health`                                                                          |

Example request:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user2@borrowbox.com","password":"Demo@123"}' | jq -r '.data.token')

curl -s http://localhost:5000/api/dashboard/stats -H "Authorization: Bearer $TOKEN" | jq
```

---

## Security model

- Passwords hashed with bcrypt (10 rounds) and never returned in responses
- JWT sessions signed with HS256, an explicit issuer and a 7 day expiry; the user record is re-read
  on every request so role changes and deletions take effect immediately
- Joi validation with sanitisation on every write endpoint: tag characters and control codes are
  stripped, string lengths and numeric ranges are bounded, URI fields must be http(s)
- Ownership checks on items, requests, messages, notifications, wishlist entries and reviews
- Rate limiting: 300 requests per 15 minutes per IP on the API, 30 on authentication, 120 writes
- `helmet` security headers with a scoped content security policy, HSTS in production
- CORS allowlist driven by `API_ALLOWED_ORIGINS` in production, permissive only for localhost in development
- Pagination and filter inputs clamped, so oversized queries cannot exhaust memory
- Error responses never leak stack traces in production
- Public endpoints exclude email addresses unless the caller is an administrator
- Demo credentials endpoint is disabled when `NODE_ENV=production`
- Reviews are only accepted from members who returned the item, and only once per item

---

## Design system

- **Typography**: Space Grotesk for display, Plus Jakarta Sans for body text
- **Colour**: indigo brand scale (`brand-50` to `brand-900`), zinc neutrals, semantic success,
  warning and danger tones; all colours expressed as HSL CSS variables with a dark theme
- **Components**: `.btn`, `.card`, `.input`, `.select`, `.chip`, `.badge-pill`, `.skeleton` and
  related utilities defined once in `frontend/src/index.css`
- **Iconography**: Lucide only. Categories store icon keys (`wrench`, `tent`, `book-open`, ...) that
  resolve through `frontend/src/lib/categoryIcons.jsx`
- **Brand**: `frontend/src/components/Logo.jsx` renders the mark and wordmark; `frontend/public/favicon.svg`
  provides the browser icon
- **Imagery**: listing photography comes from Unsplash URLs stored in the data layer

---

## Project structure

```
BorrowBox/
├── backend/
│   ├── src/
│   ├── scripts/            seed script for resetting the demo database
│   ├── src/
│   │   ├── config/         storage (JSON persistence + seed) and Swagger definition
│   │   ├── middleware/     authentication, authorisation, error handling
│   │   ├── routes/         auth, users, categories, items, borrow requests, reviews,
│   │   │                   notifications, wishlist, messages, dashboard
│   │   ├── utils/          Joi schemas, sanitisers and response serialisers
│   │   ├── app.js          Express application, security middleware and routing
│   │   └── server.js       process bootstrap, graceful shutdown
│   └── data/               generated JSON database (git ignored)
└── frontend/
    ├── public/             favicon and static assets
    └── src/
        ├── components/     Logo, Navbar, Footer, ItemCard, ErrorBoundary
        ├── context/        AuthContext (token persistence) and ThemeContext
        ├── lib/            API client and category icon registry
        ├── pages/          Home, Browse, ItemDetail, ListItem, Dashboard, MyItems,
        │                   Requests, Wishlist, Messages, Profile, Login, Register, InfoPage
        ├── App.jsx         routing, layout, 404 handling
        └── index.css       design tokens and component utilities
```

---

## Scripts

| Location  | Command           | Description                                          |
| --------- | ----------------- | ---------------------------------------------------- |
| backend   | `npm run dev`     | Start with file watching                             |
| backend   | `npm start`       | Start the API server                                 |
| backend   | `npm run seed`    | Reset `data/db.json` and reseed demo data            |
| backend   | `npm test`        | API contract and security tests (in-process server)  |
| frontend  | `npm run dev`     | Start the Vite dev server on port 5173                |
| frontend  | `npm run build`   | Production build into `frontend/dist`                |
| frontend  | `npm run preview` | Serve the production build on port 4173              |
| frontend  | `npm run check`   | Render every page to a string and report failures    |
| frontend  | `npm run verify`  | `npm run check` followed by `npm run build`          |

Both test suites are self-contained: the API tests start their own server on an ephemeral port
with a throwaway database, and the render check bundles the app with esbuild and server-renders
every route with a minimal DOM shim.

---

## License

MIT. See the repository for details.
