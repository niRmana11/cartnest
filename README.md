# 🛒 CartNest — Full-Stack Shopping Cart Application

> **Internship Project | SLT Sri Lanka | Digital Platforms Development Section**
> Built with MERN Stack + Tailwind CSS | Learn-by-Doing Approach

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Brand & Architecture Decision](#brand--architecture-decision)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Authentication Strategy](#authentication-strategy)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [7-Day Development Plan](#7-day-development-plan)
- [Hosting Strategy](#hosting-strategy)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [VSCode Agent Prompt](#vscode-agent-prompt)
- [Learning Resources](#learning-resources)
- [Future Enhancements](#future-enhancements)

---

## Project Overview

**CartNest** is a full-stack e-commerce shopping cart application developed as part of a mandatory university internship at **Sri Lanka Telecom (SLT) — Digital Platforms Development Section**.

The application allows users to browse products across multiple categories (Vegetables, Fruits, Cakes, Biscuits, etc.), manage their cart, and authenticate securely using Google, Facebook, or Passkey. It supports at least **100 concurrent users** and is fully responsive on desktop and mobile.

### SRS-Aligned Deliverables

| Requirement | Status |
|---|---|
| User auth: Google, Facebook, Passkey | ✅ Planned |
| Product categories (Vegetables, Fruits, Cakes, Biscuits) | ✅ Planned |
| Product images, name, price, description | ✅ Planned |
| Add / Edit / Delete cart items | ✅ Planned |
| Dynamic price total calculation | ✅ Planned |
| Responsive design (desktop + mobile) | ✅ Planned |
| Admin product management | ✅ Planned |
| 100+ concurrent users | ✅ Architecture supports |

---

## Brand & Architecture Decision

### Why "CartNest"?

- **Cart** — directly communicates the core function
- **Nest** — implies a safe, organized, home-like shopping experience
- Short, memorable, domain-friendly
- Professional and suitable for a telecom company's internal project showcase

### Architecture: Three-Tier MVC with REST API

After evaluating multiple architectures (Monolith, MVC, Microservices, Serverless), **Three-Tier MVC with REST API** was selected for these reasons:

| Factor | Why MVC REST API Wins |
|---|---|
| **Timeline** | 1 week — no time for Kubernetes or microservices setup |
| **Scale** | REST + MongoDB Atlas handles 100+ concurrent users comfortably |
| **Viva readiness** | Clear separation (Model / View / Controller) is easy to explain |
| **Free hosting** | Render (backend) + Vercel (frontend) are both MVC-friendly |
| **Learning value** | Industry-standard pattern used in most real-world apps |
| **MERN fit** | React = View, Express/Node = Controller, MongoDB = Model |

**Not chosen:** Microservices (too complex for 1 week), Monolith (hard to explain separation at viva), Serverless (vendor lock-in, cold starts hurt UX).

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| **React 18** | Component-based UI |
| **Vite** | Fast dev server & build tool |
| **Tailwind CSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Zustand** | Lightweight global state (cart, auth) |
| **Axios** | HTTP client for API calls |
| **React Hot Toast** | Notifications |

### Backend
| Tool | Purpose |
|---|---|
| **Node.js 20** | Runtime |
| **Express.js** | REST API framework |
| **MongoDB Atlas** | Cloud database (free tier) |
| **Mongoose** | ODM for MongoDB |
| **Passport.js** | Auth middleware (Google, Facebook OAuth) |
| **SimpleWebAuthn** | Passkey (WebAuthn) implementation |
| **JWT + HTTP-only Cookies** | Secure session management |
| **bcryptjs** | Password hashing |
| **Helmet.js** | Security HTTP headers |
| **express-rate-limit** | Rate limiting for 100 concurrent users |
| **CORS** | Cross-origin resource sharing |
| **Cloudinary** | Product image storage (free tier) |

### Dev & Deployment
| Tool | Purpose |
|---|---|
| **GitHub** | Version control |
| **Vercel** | Frontend hosting (free) |
| **Render** | Backend hosting (free) |
| **MongoDB Atlas** | Database hosting (free 512MB) |
| **Cloudinary** | Image CDN (free 25 credits/month) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                React 18 + Vite + Tailwind CSS               │
│                    Hosted on: Vercel                         │
└─────────────────────┬───────────────────────────────────────┘
                       │  HTTPS REST API calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS API SERVER                    │
│              Node.js 20 | Hosted on: Render                 │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Products │  │   Cart   │  │  Admin   │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Middleware Layer                          │  │
│  │  Helmet | CORS | Rate-Limit | JWT Auth | Logging    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
          ┌────────▼───────┐    ┌─────────▼────────┐
          │  MongoDB Atlas  │    │    Cloudinary     │
          │  (Free Tier)   │    │  (Image Storage) │
          └────────────────┘    └──────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
  ┌────▼────┐ ┌───▼───┐ ┌────▼────┐
  │  Users  │ │Products│ │  Carts  │
  │Collection│ │Collection│ │Collection│
  └─────────┘ └────────┘ └─────────┘

External Auth:
  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │  Google   │  │ Facebook  │  │  WebAuthn │
  │  OAuth2   │  │  OAuth2   │  │ (Passkey) │
  └───────────┘  └───────────┘  └───────────┘
```

---

## Project Structure

```
cartnest/
├── 📁 frontend/                    # React + Vite app
│   ├── 📁 public/
│   │   └── favicon.svg
│   ├── 📁 src/
│   │   ├── 📁 api/                 # Axios API call functions
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   └── cartApi.js
│   │   ├── 📁 components/          # Reusable UI components
│   │   │   ├── 📁 auth/
│   │   │   │   ├── LoginModal.jsx
│   │   │   │   ├── GoogleButton.jsx
│   │   │   │   ├── FacebookButton.jsx
│   │   │   │   └── PasskeyButton.jsx
│   │   │   ├── 📁 cart/
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CartTotal.jsx
│   │   │   ├── 📁 products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   └── CategoryFilter.jsx
│   │   │   └── 📁 layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Layout.jsx
│   │   ├── 📁 pages/               # Route-level page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── 📁 admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ProductsManage.jsx
│   │   │       └── CategoriesManage.jsx
│   │   ├── 📁 store/               # Zustand global state
│   │   │   ├── authStore.js
│   │   │   └── cartStore.js
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useCart.js
│   │   ├── 📁 utils/               # Helper functions
│   │   │   ├── formatCurrency.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📁 backend/                     # Express.js API
│   ├── 📁 config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── passport.js             # OAuth strategies
│   │   └── cloudinary.js           # Image upload config
│   ├── 📁 controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── adminController.js
│   ├── 📁 models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Cart.js
│   ├── 📁 routes/                  # Express routers
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── adminRoutes.js
│   ├── 📁 middleware/              # Custom middleware
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── adminMiddleware.js      # Admin role check
│   │   └── uploadMiddleware.js     # Multer image upload
│   ├── 📁 utils/
│   │   ├── generateToken.js
│   │   └── apiError.js
│   ├── .env.example
│   ├── server.js                   # Entry point
│   └── package.json
│
├── .gitignore
└── README.md                       # This file
```

---

## Features

### 🛍️ User Features
- Browse products by category (Vegetables, Fruits, Cakes, Biscuits)
- View product image, name, price, and description
- Add items to cart with one click
- Edit quantity of items in cart
- Remove items from cart
- See real-time cart total with item count badge
- Responsive design on all screen sizes
- Secure login via Google, Facebook, or Passkey

### 🔧 Admin Features
- Protected admin dashboard (separate login)
- Add new products with image upload
- Edit existing product details
- Delete products
- Manage categories (Add / Edit / Delete)

### 🔒 Security Features
- HTTP-only JWT cookies (XSS protection)
- Helmet.js security headers
- Rate limiting (prevents DDoS)
- Input validation with express-validator
- CORS restricted to frontend domain
- Passkey (WebAuthn) — phishing-resistant login

---

## Authentication Strategy

### Flow Diagram

```
User clicks Login
      │
      ├─── Google OAuth2 ──► Google Consent ──► Callback ──► JWT Cookie ──► Logged In
      │
      ├─── Facebook OAuth2 ─► Facebook Consent ─► Callback ─► JWT Cookie ─► Logged In
      │
      └─── Passkey ─────────► Browser Biometric ─► WebAuthn ─► JWT Cookie ─► Logged In
```

### Why HTTP-only Cookies over localStorage?
- localStorage is readable by JavaScript → vulnerable to XSS attacks
- HTTP-only cookies cannot be accessed by JavaScript → much safer
- This is the **industry standard** approach (Amazon, Google do this)

---

## Database Design

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  provider: enum['google', 'facebook', 'passkey', 'local'],
  providerId: String,
  role: enum['user', 'admin'],  // default: 'user'
  passkeys: [{
    credentialId: String,
    publicKey: Buffer,
    counter: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: { url: String, publicId: String },  // Cloudinary
  category: ObjectId (ref: 'Category'),
  stock: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String,       // e.g., "Vegetables"
  slug: String,       // e.g., "vegetables"
  icon: String,       // emoji or icon name
  createdAt: Date
}
```

### Cart Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    priceAtTime: Number   // snapshot of price when added
  }],
  updatedAt: Date
}
```

---

## API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/google` | Initiate Google OAuth |
| GET | `/google/callback` | Google OAuth callback |
| GET | `/facebook` | Initiate Facebook OAuth |
| GET | `/facebook/callback` | Facebook OAuth callback |
| POST | `/passkey/register/options` | Generate passkey registration options |
| POST | `/passkey/register/verify` | Verify and save passkey |
| POST | `/passkey/login/options` | Generate passkey login options |
| POST | `/passkey/login/verify` | Verify passkey and issue JWT |
| POST | `/logout` | Clear JWT cookie |
| GET | `/me` | Get current user (protected) |

### Product Routes — `/api/products`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all active products (with category filter) |
| GET | `/:id` | Get single product |
| GET | `/category/:slug` | Get products by category |

### Cart Routes — `/api/cart` (Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get user's cart |
| POST | `/` | Add item to cart |
| PUT | `/:itemId` | Update item quantity |
| DELETE | `/:itemId` | Remove item from cart |
| DELETE | `/` | Clear entire cart |

### Admin Routes — `/api/admin` (Protected + Admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Get all products (including inactive) |
| POST | `/products` | Create product (with image upload) |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

---

## 7-Day Development Plan

> **⚠️ Important:** Build and understand each step before moving to the next. You will likely face a viva on this project — know every decision you made and why.

### Day 1 — Foundation & Auth Backend
**Goal:** Working authentication API

- [ ] Create GitHub repo `cartnest`, initialize README
- [ ] Set up `backend/` folder with Express + Mongoose
- [ ] Connect MongoDB Atlas (create free cluster)
- [ ] Implement `User` and `Category` models
- [ ] Set up Passport.js with Google OAuth strategy
- [ ] Set up Passport.js with Facebook OAuth strategy
- [ ] Implement SimpleWebAuthn for Passkey registration + login
- [ ] JWT cookie generation on successful auth
- [ ] Test all auth routes with Postman/Thunder Client
- [ ] Push to GitHub

**What to learn:** How OAuth2 works (Authorization Code Flow), what JWT is, why HTTP-only cookies.

---

### Day 2 — Products & Cart Backend
**Goal:** Complete REST API

- [ ] Create `Product`, `Cart` models
- [ ] Implement product CRUD controllers + routes
- [ ] Implement cart controllers (add, update, delete, get)
- [ ] Set up Cloudinary for image uploads
- [ ] Multer middleware for file handling
- [ ] Rate limiting with express-rate-limit
- [ ] Helmet.js security headers
- [ ] Seed database with sample categories and products
- [ ] Full API test with Postman
- [ ] Push to GitHub

**What to learn:** REST API design, Mongoose relationships (populate), multipart form data.

---

### Day 3 — Frontend Foundation + Auth UI
**Goal:** React app running with login flow

- [ ] Set up `frontend/` with Vite + React + Tailwind CSS
- [ ] Install dependencies (Zustand, Axios, React Router, React Hot Toast)
- [ ] Configure Tailwind CSS (`tailwind.config.js`)
- [ ] Build `Navbar`, `Footer`, `Layout` components
- [ ] Build `LoginPage` with Google, Facebook, Passkey buttons
- [ ] Set up Zustand `authStore` (user state, login, logout)
- [ ] Set up Axios instance with base URL + credentials
- [ ] Protect routes with auth guard (redirect to login if not authenticated)
- [ ] Test login flow end-to-end (frontend ↔ backend)
- [ ] Push to GitHub

**What to learn:** Zustand vs Redux (why simpler is better for this project), React Router protected routes.

---

### Day 4 — Shop Page & Product Browsing
**Goal:** Users can browse and filter products

- [ ] Build `ProductCard` component (image, name, price, add-to-cart button)
- [ ] Build `ProductGrid` component with responsive layout
- [ ] Build `CategoryFilter` component (tab/pill UI)
- [ ] Build `ShopPage` combining filter + grid
- [ ] Connect to backend API (fetch products, filter by category)
- [ ] Loading skeletons while data loads
- [ ] Empty state when no products in category
- [ ] Mobile responsive testing
- [ ] Push to GitHub

**What to learn:** React data fetching patterns, component composition, Tailwind responsive prefixes (sm: md: lg:).

---

### Day 5 — Cart System (Core Feature)
**Goal:** Full cart CRUD with live total

- [ ] Build `CartDrawer` (slide-out panel from right)
- [ ] Build `CartItem` (product image, name, quantity controls, delete button)
- [ ] Build `CartTotal` (subtotal, item count)
- [ ] Set up Zustand `cartStore` (items, add, update, remove, total)
- [ ] Sync cart with backend on every change
- [ ] Cart badge on Navbar (item count)
- [ ] Optimistic UI updates (instant feedback before API response)
- [ ] Guest cart handling (prompt login when checking out)
- [ ] Build `CartPage` as full-page view
- [ ] Push to GitHub

**What to learn:** Optimistic updates pattern, why cart state is synced to backend (so cart survives browser refresh).

---

### Day 6 — Admin Dashboard + Polish
**Goal:** Admin can manage products; app is polished

- [ ] Build Admin login (separate route `/admin/login`)
- [ ] `AdminDashboard` with overview stats
- [ ] `ProductsManage` — table with add/edit/delete
- [ ] Product form with Cloudinary image upload
- [ ] `CategoriesManage` — CRUD for categories
- [ ] Toast notifications everywhere (success/error)
- [ ] 404 page
- [ ] Loading states on all async actions
- [ ] Mobile nav (hamburger menu)
- [ ] Final responsive check on all pages
- [ ] Push to GitHub

**What to learn:** Role-based access control (RBAC), file upload with preview, form state management.

---

### Day 7 — Deploy & Final Testing
**Goal:** Live application accessible via public URL

- [ ] **Deploy Backend to Render:**
  - Create Render account → New Web Service → Connect GitHub
  - Set all environment variables in Render dashboard
  - Set start command: `node server.js`
  - Test API endpoints at Render URL

- [ ] **Deploy Frontend to Vercel:**
  - Create Vercel account → Import GitHub repo → Set root to `frontend/`
  - Set `VITE_API_URL` to your Render backend URL
  - Vercel auto-detects Vite — just deploy

- [ ] **Post-deployment testing:**
  - Google/Facebook OAuth with production callback URLs
  - Passkey registration + login
  - Add product to cart, checkout summary
  - Admin login and product management
  - Test on mobile browser (real device if possible)

- [ ] Update README with live URLs
- [ ] Final GitHub push with clean commit history

**What to learn:** Environment variables (never commit .env), CORS production config, OAuth redirect URIs for production.

---

## Hosting Strategy

### Why These Free Platforms?

| Service | Platform | Free Tier | Notes |
|---|---|---|---|
| **Frontend** | Vercel | ✅ Unlimited | Best for React/Vite — auto-deploy on git push |
| **Backend** | Render | ✅ 750 hrs/month | Spins down after 15 min idle (free tier) |
| **Database** | MongoDB Atlas | ✅ 512 MB | Always-on, no spin-down |
| **Images** | Cloudinary | ✅ 25 credits/month | Global CDN for product images |

### ⚠️ Render Free Tier Cold Start
Render free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds. This is acceptable for an internship project demo. Mention this at your viva — it shows you understand trade-offs.

**Solution for demo day:** Keep a browser tab open to your API health endpoint, or use a free uptime monitor like UptimeRobot to ping it every 5 minutes.

---

## Setup & Installation

### Prerequisites
- Node.js 20+ (`node -v` to check)
- npm 9+
- Git
- A free MongoDB Atlas account
- A free Cloudinary account
- Google Cloud Console project (for Google OAuth)
- Facebook Developers app (for Facebook OAuth)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/cartnest.git
cd cartnest
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Seed the Database
```bash
cd backend
npm run seed
```
This adds sample categories (Vegetables, Fruits, Cakes, Biscuits) and 8 sample products.

---

## Environment Variables

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/cartnest

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# WebAuthn (Passkey)
RP_ID=localhost
RP_NAME=CartNest
ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## VSCode Agent Prompt

Copy and paste this prompt to your VSCode AI agent (GitHub Copilot, Continue, Cursor, etc.) at the start of development:

---

```
You are helping me build CartNest, a full-stack shopping cart application 
for my university internship at SLT (Sri Lanka Telecom), Digital Platforms 
Development Section. This is a LEARN-BY-DOING project — I need to understand 
every line of code we write, not just copy-paste it.

PROJECT CONTEXT:
- SRS requires: user auth (Google, Facebook, Passkey), product browsing by 
  category, shopping cart CRUD, dynamic totals, admin product management
- Must handle 100+ concurrent users
- Responsive on desktop and mobile
- Must be fully hosted (Vercel frontend + Render backend) within 1 week
- I may face a viva (oral exam) on this project, so I need to understand 
  all architectural decisions

TECH STACK (fixed, do not suggest alternatives):
- Frontend: React 18, Vite, Tailwind CSS, Zustand, Axios, React Router v6
- Backend: Node.js 20, Express.js, MongoDB + Mongoose, Passport.js, 
  SimpleWebAuthn, JWT (HTTP-only cookies)
- Image storage: Cloudinary
- Hosting: Vercel (frontend), Render (backend), MongoDB Atlas (DB)

CODING RULES:
1. After every code block, give me a short plain-English explanation of 
   what it does and WHY — assume I'm learning
2. When you make an architectural decision (e.g., why HTTP-only cookies over 
   localStorage), explain the trade-offs clearly
3. Break tasks into small steps — one file or one feature at a time
4. Always follow the project folder structure in the README
5. Use async/await (not callbacks or .then chains)
6. Add comments inside code for anything non-obvious
7. Point out security considerations whenever they arise
8. If I ask "why", always explain — never just say "best practice"
9. Suggest what to test after each step so I can verify it works before 
   continuing
10. Help me understand what I would be asked at a viva for each topic

CURRENT FOCUS: [Update this line each day to tell the agent what you're 
working on, e.g., "Day 1 - Setting up Google OAuth with Passport.js"]

Start by asking me which day of the 7-day plan I'm on, then guide me 
through that day's tasks one step at a time.
```

---

## Learning Resources

### Understand These Before Your Viva

**OAuth2 & Authentication**
- [OAuth2 Simplified (Aaron Parecki)](https://aaronparecki.com/oauth-2-simplified/) — best visual explanation
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [WebAuthn Guide (Passkeys)](https://webauthn.guide/)

**MERN Stack**
- [MongoDB University (Free)](https://learn.mongodb.com/) — official MongoDB courses
- [Express.js Official Docs](https://expressjs.com/)
- [React Official Docs (react.dev)](https://react.dev/)

**Concepts to Explain at Viva**
| Topic | What to Know |
|---|---|
| MVC Pattern | Model = data, View = UI, Controller = business logic |
| REST API | Stateless, HTTP verbs (GET/POST/PUT/DELETE), JSON |
| JWT | Header.Payload.Signature, why HTTP-only cookie |
| OAuth2 | Authorization Code Flow, why not password sharing |
| Passkeys | WebAuthn, public/private key, phishing-resistant |
| Zustand | Global state without Redux boilerplate |
| Mongoose | ODM, schemas, validation, populate |
| CORS | Why browsers block cross-origin, how to allow |
| Rate Limiting | Prevent abuse, protect 100-user concurrency |

---

## Future Enhancements

*(As specified in SRS Section 6)*

- [ ] Payment gateway integration (Stripe / PayHere for Sri Lanka)
- [ ] Order history and invoice PDF generation
- [ ] Product recommendation system (collaborative filtering)
- [ ] Email notifications (order confirmation)
- [ ] Product search with full-text indexing
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Multi-language support (Sinhala, Tamil, English)

---

## License

This project is developed for educational purposes as part of a university internship at SLT Sri Lanka.

---

## Author

**Your Name**
University Intern — SLT Digital Platforms Development Section
GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

*Built with ❤️ for SLT Sri Lanka Internship 2026*
