# Ecommerce Platform

A production-ready ecommerce platform built with a modern tech stack, featuring a customer storefront, admin dashboard, and secure payment processing.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Next.js   │     │   Spring    │
│   Proxy     │     │   Frontend  │────▶│   Boot API  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                        ┌──────▼──────┐
                                        │  PostgreSQL │
                                        └─────────────┘
```

## Tech Stack

**Frontend**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod validation

**Backend**
- Spring Boot 3
- Java 21
- JPA/Hibernate
- RESTful API design

**Infrastructure**
- Docker & Docker Compose
- Nginx reverse proxy
- PostgreSQL 16

**Integrations**
- Google OAuth 2.0
- Stripe Payments

## Features

### Customer Experience
- Browse products by category
- Shopping cart management
- Secure checkout with Stripe
- User account creation and login

### Admin Dashboard
- Inventory management (CRUD operations)
- Image uploads for products
- Real-time session analytics
- User management

### Security
- Role-based access control (Customer, Registered, Admin)
- Session-based authentication
- Secure password handling
- Protected API endpoints

## Quick Start

```bash
# Clone and configure
cp .env.example .env

# Start all services
docker compose up --build -d
```

Access the application at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/server/inventoryitem` | List all products |
| POST | `/server/inventoryitem` | Create product (Admin) |
| GET | `/server/users` | List users (Admin) |
| GET | `/server/session/stats` | Session analytics (Admin) |

## Database Schema

- **Users** - Account credentials, roles, timestamps
- **Sessions** - Token-based session management with expiration
- **InventoryItem** - Product catalog with pricing and categories
- **Cart / CartItem** - Shopping cart functionality

## Local Development

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database access
docker compose exec postgres psql -U $DB_USER -d $DB_NAME
```

## License

TODOS:
- add long term account persistence and pre string email gateway for checkout (not a hard login unless email exists)
- email via Resend (printmarket.ca verified): order confirmation, account recovery, customer support — EmailService.java wired up, test endpoint working
- add color configuration for the items for Amy
- Customer support contact (maybe websocket or direct email for now to keep it simple)
- partition server ubuntu proxmox provisioned server into staging and production (prod gets nginx configured firewall protected path)
- auto generate longterm disc drive backups cron jobs onto the HD drives
- configure secondary Nginx route (routes based on destination url) requires the fancy firewall protections you configured.
- add in Product pages (dream todo add STL support for the different colors)
# Easy Post 
- this is used to calculate shipping on the checkout page. 
- the checkout page is needed before a registered state for the user
[EasyPost documentation link for the java module]( https://github.com/EasyPost/easypost-java )

# Resend
- this is for email configurations. this is relatively simple to work with. 
- not much to mess around with easy java docs

MIT
