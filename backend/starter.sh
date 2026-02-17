#!/bin/bash

# Spring Boot Project Generator
# Usage: ./starter.sh [project-name] [group-id]
# Example: ./starter.sh backend com.ecommerce

PROJECT_NAME=${1:-backend}
GROUP_ID=${2:-com.ecommerce}
PACKAGE_NAME="${GROUP_ID}.${PROJECT_NAME}"

curl https://start.spring.io/starter.zip \
  -d type=maven-project \        # Maven over Gradle - industry standard, works well in Neovim
  -d language=java \              # Java
  -d bootVersion=3.5.0 \          # Latest stable (no SNAPSHOT/M1 suffix)
  -d javaVersion=21 \             # LTS version - long term support
  -d groupId="${GROUP_ID}" \      # Your namespace (reverse domain)
  -d artifactId="${PROJECT_NAME}" \
  -d name="${PROJECT_NAME}" \
  -d packageName="${PACKAGE_NAME}" \
  -d dependencies=web,data-jpa,postgresql,validation,devtools,lombok \
  -o "${PROJECT_NAME}.zip"
  # Dependencies:
  # - web: REST controllers, HTTP server (embedded Tomcat)
  # - data-jpa: Database ORM, repositories
  # - postgresql: PostgreSQL driver
  # - validation: Request validation (@NotNull, @Email, etc.)
  # - devtools: Auto-restart during development
  # - lombok: Reduces boilerplate (@Getter, @Setter, @Builder)

unzip "${PROJECT_NAME}.zip" -d "${PROJECT_NAME}" && rm "${PROJECT_NAME}.zip"

echo "Project '${PROJECT_NAME}' created successfully"
