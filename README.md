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
- finish configuring a secondary staging environment before deploying to production.  (Main is done)
- do some ip white listing on cloudflare. 
- eventually transfer from manual deploy scripts to pushed images. less failover between deployments (bug in git pull)
- remember to secure cloudflare traffic (non-flexible)
- split environment variables properly. 
- second pipeline for dev (goes hand in hand for other 3 deploy scripts)
- finish designing the chat with user feature for returns. 
- review what was requesting/logging ids so much
- make sure that the nginx internet facing port has NO leaks at all. tightest restrictions possible on ingress communication

# Broken
- adding images is busted. some checkout items are busted (maybe related that they arent being generated with images) something for sure to do with stripe
- backend ip addresses and checkout redirect urls arent pointing to an actual address in the "prod"
- create shipping label broke (again likely shippo webhook misconfiguration)
- the shipping list breaks on mobile view. same with some tables in the admin dashboard. 

## License

MIT
