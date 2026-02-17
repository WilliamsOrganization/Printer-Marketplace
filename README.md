# Ecommerce App

Full-stack ecommerce application with Next.js frontend, Spring Boot backend, and PostgreSQL database.

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** Spring Boot 3 (Java 21)
- **Database:** PostgreSQL 16
- **Containerization:** Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Copy `.env.example` to `.env` and configure your environment variables

### Run the full stack

```bash
docker compose up --build -d
```

| Service   | URL                     |
|-----------|-------------------------|
| Frontend  | http://localhost:3000   |
| Backend   | http://localhost:8080   |
| Postgres  | localhost:5432          |

### Useful commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose up --build -d

# Stop all services
docker compose down

# Connect to database
docker compose exec postgres psql -U $DB_USER -d $DB_NAME
```

## Project Structure

```
my-app/
├── frontend/          # Next.js app
├── backend/           # Spring Boot API
│   └── src/main/java/com/ecommerce/backend/
│       └── entity/    # JPA entities
├── data/              # Postgres data (gitignored)
├── docker-compose.yaml
└── .env
```

## TODO

- Admin page
- Checkout page
- Information page
- Settings/contact page
- DB tables: User, Products, Carts, CartItems, Orders, OrderItems
- Flat shipping rate configuration with Stripe
