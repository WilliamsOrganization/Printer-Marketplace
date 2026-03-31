# PrintMarket — Ecommerce Platform

An ecommerce platform for selling art prints, built with Next.js and Spring Boot. Features a customer storefront with checkout, admin dashboard, and shipping rate calculation via Shippo.

## Tech Stack

**Frontend**
- Next.js 16 (App Router, React 19)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Framer Motion animations
- Stripe (checkout session creation — moving to backend, see TODOs)
- Google Places Autocomplete (address input via use-places-autocomplete)

**Backend**
- Spring Boot 3.5 / Java 21
- JPA/Hibernate
- Spring Security (role-based access)
- Shippo SDK (shipping rates, label purchasing)
- Stripe Java SDK (to be wired up — see TODOs)
- Resend (transactional email)

**Infrastructure**
- Docker & Docker Compose
- Nginx reverse proxy
- PostgreSQL 16
- GitHub Actions CI/CD (deploys via SSH)
- Ansible (server provisioning)
- Terraform (server provisioning)

## Features

### Customer Storefront
- Browse and filter products
- Shopping cart (add, update quantity, remove)
- Address autocomplete with Google Places
- Shipping rate calculation via Shippo (CA/US)
- Stripe checkout with order confirmation page

### Admin Dashboard
- Inventory management (CRUD, image uploads, archiving)
- Session analytics
- User management

### Security
- Role-based access control (Customer, Registered, Admin)
- Google OAuth 2.0 + password login
- Protected API endpoints via Spring Security

## Database Schema

- **Users** — accounts, roles (CUSTOMER, REGISTERED, ADMIN), credentials
- **Sessions** — token-based session management with expiration
- **InventoryItem** — product catalog (name, description, price, images, categories)
- **Cart / CartItem** — shopping cart per user
- **Shipping** — shipping records (needs refactor to match Shippo API)
- **Orders / OrderItem** — order history

## Quick Start

```bash
# Clone and configure
cp .env.example .env

# Start all services
docker compose up --build -d
```

Access the application at `http://localhost:3000`

## Local Development

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database access
docker compose exec postgres psql -U $DB_USER -d $DB_NAME
```

---

## TODOs

### Stripe Refactor (Priority)
- Move Stripe checkout session creation from frontend (checkout_sessions/route.ts) to Spring backend
- Spring already owns cart, inventory, and shipping — it should own Stripe session creation too
- Frontend sends only `{ rateId }` (Shippo rate object_id) to backend, backend builds line items from DB cart, creates Stripe session, returns URL
- Success page (success/page.jsx) can stay on frontend for now — it's read-only (stripe.checkout.sessions.retrieve)
- Long term: move success page retrieval to Spring endpoint (GET /orders/confirm?session_id=xxx) and remove frontend Stripe SDK entirely
- See route.ts TODO comment for full architectural notes

### Shipping (Shippo)
- Shippo rates are ephemeral — don't persist to DB, use Shippo as source of truth
- Store addresses, shipments, and transactions in DB (immutable once created, needed for order history/fulfillment)
- Refactor Shipping.java entity to match Shippo API documentation
- Known bug: Shippo intermittently returns empty rates on first request for new addresses (see ShippoService.java)
- Wire up "Continue to Payment" button to pass selected rate through to Stripe checkout

### Frontend
- Product pages need server component wrapper for SEO indexing (product-card.tsx, product/page.tsx)
- Success page needs product image URLs instead of generic quantity badge
- Price filter toggles not working on shop page
- Support multiple pricing tiers for products (create-inventory-item-form.tsx, InventoryItem.java)
- Add color configuration for items

### Auth/Security
- Password hashing (AuthService.java, DataInitializer.java)
- Email authentication layer for account verification
- Proper account creation process for order updates (UserService.java)
- Pre-checkout email gateway (not a hard login unless email exists)

### Email (Resend)
- Order confirmation emails
- Account recovery
- Customer support notifications
- EmailService.java wired up, test endpoint working, printmarket.ca verified

### Infrastructure
- Partition Proxmox server into staging and production environments
- Configure production Nginx reverse proxy with firewall rules
- Auto-generate long-term backups via cron jobs to HD drives
- Open outward-facing port and configure DNS
- Product pages (dream: STL support for different color previews)
- Customer support contact (websocket or direct email)

## License

MIT
