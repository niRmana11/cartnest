# 🛒 CartNest — Full-Stack Shopping Cart Application

> **Internship Project | SLT Sri Lanka | Digital Platforms Development Section**

---

## Project Overview

**CartNest** is a full-stack e-commerce shopping cart application developed as part of an university internship at **Sri Lanka Telecom (SLT) — Digital Platforms Development Section**.

The application allows users to browse products across multiple categories (Vegetables, Fruits, Cakes, Biscuits, etc.), manage their cart, and authenticate securely using Google, Facebook, or Passkey. It supports at least **100 concurrent users** and is fully responsive on desktop and mobile.

---

## Brand & Architecture Decision

### Why "CartNest"?

- **Cart** — directly communicates the core function
- **Nest** — implies a safe, organized, home-like shopping experience
- Short, memorable, domain-friendly
- Professional and suitable for a telecom company's internal project showcase

### Architecture: Three-Tier MVC with REST API

After evaluating multiple architectures (Monolith, MVC, Microservices, Serverless), **Three-Tier MVC with REST API** was selected for these reasons:

| Factor             | Why MVC REST API Wins                                           |
| ------------------ | --------------------------------------------------------------- |
| **Timeline**       | 1 week — no time for Kubernetes or microservices setup          |
| **Scale**          | REST + MongoDB Atlas handles 100+ concurrent users comfortably  |
| **Viva readiness** | Clear separation (Model / View / Controller) is easy to explain |
| **Free hosting**   | Render (backend) + Vercel (frontend) are both MVC-friendly      |
| **Learning value** | Industry-standard pattern used in most real-world apps          |
| **MERN fit**       | React = View, Express/Node = Controller, MongoDB = Model        |

**Not chosen:** Microservices (too complex for 1 week), Monolith (hard to explain separation at viva), Serverless (vendor lock-in, cold starts hurt UX).

---

## Tech Stack

### Frontend

| Tool                | Purpose                               |
| ------------------- | ------------------------------------- |
| **React 18**        | Component-based UI                    |
| **Vite**            | Fast dev server & build tool          |
| **Tailwind CSS**    | Utility-first styling                 |
| **React Router v6** | Client-side routing                   |
| **Zustand**         | Lightweight global state (cart, auth) |
| **Axios**           | HTTP client for API calls             |
| **React Hot Toast** | Notifications                         |

### Backend

| Tool                        | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| **Node.js 20**              | Runtime                                  |
| **Express.js**              | REST API framework                       |
| **MongoDB Atlas**           | Cloud database (free tier)               |
| **Mongoose**                | ODM for MongoDB                          |
| **Passport.js**             | Auth middleware (Google, Facebook OAuth) |
| **SimpleWebAuthn**          | Passkey (WebAuthn) implementation        |
| **JWT + HTTP-only Cookies** | Secure session management                |
| **bcryptjs**                | Password hashing                         |
| **Helmet.js**               | Security HTTP headers                    |
| **express-rate-limit**      | Rate limiting for 100 concurrent users   |
| **CORS**                    | Cross-origin resource sharing            |
| **Cloudinary**              | Product image storage (free tier)        |

### Dev & Deployment

| Tool              | Purpose                           |
| ----------------- | --------------------------------- |
| **GitHub**        | Version control                   |
| **Vercel**        | Frontend hosting (free)           |
| **Render**        | Backend hosting (free)            |
| **MongoDB Atlas** | Database hosting (free 512MB)     |
| **Cloudinary**    | Image CDN (free 25 credits/month) |

---

## Project Structure

```
cartnest/
├── frontend/                      # React + Vite app
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   ├── adminApi.js
│       │   ├── axiosInstance.js
│       │   ├── categoryApi.js
│       │   └── productApi.js
│       ├── assets/
│       ├── components/
│       │   ├── Footer.jsx
│       │   ├── Layout.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── admin/
│       │   │   ├── AdminStats.jsx
│       │   │   ├── CategoryManager.jsx
│       │   │   ├── ProductForm.jsx
│       │   │   └── ProductTable.jsx
│       │   ├── cart/
│       │   │   ├── CartItem.jsx
│       │   │   └── CartTotal.jsx
│       │   └── products/
│       │       ├── CategoryFilter.jsx
│       │       ├── ProductCard.jsx
│       │       └── ProductGrid.jsx
│       ├── pages/
│       │   ├── AdminPage.jsx
│       │   ├── CartPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── PrivacyPage.jsx
│       │   └── ShopPage.jsx
│       ├── store/
│       │   ├── authStore.js
│       │   └── cartStore.js
│       └── utils/
│           └── categoryIcons.js

├── backend/                       # Express.js API
│   ├── server.js
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   ├── passport.js
│   │   └── webauthn.js
│   ├── controllers/
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── productRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   └── utils/
│       └── challengeStore.js

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

| Method | Endpoint                    | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/google`                   | Initiate Google OAuth                 |
| GET    | `/google/callback`          | Google OAuth callback                 |
| GET    | `/facebook`                 | Initiate Facebook OAuth               |
| GET    | `/facebook/callback`        | Facebook OAuth callback               |
| POST   | `/passkey/register/options` | Generate passkey registration options |
| POST   | `/passkey/register/verify`  | Verify and save passkey               |
| POST   | `/passkey/login/options`    | Generate passkey login options        |
| POST   | `/passkey/login/verify`     | Verify passkey and issue JWT          |
| POST   | `/logout`                   | Clear JWT cookie                      |
| GET    | `/me`                       | Get current user (protected)          |

### Product Routes — `/api/products`

| Method | Endpoint          | Description                                    |
| ------ | ----------------- | ---------------------------------------------- |
| GET    | `/`               | Get all active products (with category filter) |
| GET    | `/:id`            | Get single product                             |
| GET    | `/category/:slug` | Get products by category                       |

### Cart Routes — `/api/cart` (Protected)

| Method | Endpoint   | Description           |
| ------ | ---------- | --------------------- |
| GET    | `/`        | Get user's cart       |
| POST   | `/`        | Add item to cart      |
| PUT    | `/:itemId` | Update item quantity  |
| DELETE | `/:itemId` | Remove item from cart |
| DELETE | `/`        | Clear entire cart     |

### Admin Routes — `/api/admin` (Protected + Admin)

| Method | Endpoint          | Description                           |
| ------ | ----------------- | ------------------------------------- |
| GET    | `/products`       | Get all products (including inactive) |
| POST   | `/products`       | Create product (with image upload)    |
| PUT    | `/products/:id`   | Update product                        |
| DELETE | `/products/:id`   | Delete product                        |
| GET    | `/categories`     | Get all categories                    |
| POST   | `/categories`     | Create category                       |
| PUT    | `/categories/:id` | Update category                       |
| DELETE | `/categories/:id` | Delete category                       |

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
git clone https://github.com/niRmana11/cartnest.git
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

## Future Enhancements

- [ ] Payment gateway integration (Stripe / PayHere for Sri Lanka)
- [ ] Order history and invoice PDF generation
- [ ] Email notifications (order confirmation)
- [ ] Product search with full-text indexing
- [ ] Product reviews and ratings

---

## License

This project is developed for educational purposes as part of a university internship at SLT Sri Lanka.

---

## Author

**Nirmana Herath**
University Intern — SLT Digital Platforms Development Section
GitHub: [@niRmana11](https://github.com/niRmana11)

---
