#!/bin/bash

# Spring Boot Project Generator
# Usage: ./starter.sh [project-name] [group-id]
# Example: ./starter.sh backend com.ecommerce

PROJECT_NAME=${1:-backend}
GROUP_ID=${2:-com.ecommerce}
PACKAGE_NAME="${GROUP_ID}.${PROJECT_NAME}"

curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.5.0 \
  -d javaVersion=21 \
  -d groupId="${GROUP_ID}" \
  -d artifactId="${PROJECT_NAME}" \
  -d name="${PROJECT_NAME}" \
  -d packageName="${PACKAGE_NAME}" \
  -d dependencies=web,data-jpa,postgresql,validation,devtools,lombok \
  -o "${PROJECT_NAME}.zip"

unzip "${PROJECT_NAME}.zip" -d "${PROJECT_NAME}" && rm "${PROJECT_NAME}.zip"

echo "Project '${PROJECT_NAME}' created successfully"
