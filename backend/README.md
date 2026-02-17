# Backend (Spring Boot)

## Recipe

- [x] Spring Boot 3.5.0
- [x] Maven
- [ ] PostgreSQL
- [ ] Stripe

## Prerequisites

- Java 21
- PostgreSQL running locally

## Run

```bash
# Development
./mvnw spring-boot:run

# Build jar
./mvnw clean package

# Run jar
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Generate New Project

```bash
./starter.sh [project-name] [group-id]
```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

