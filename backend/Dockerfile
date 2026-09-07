FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# chmod: the executable bit on mvnw doesn't survive every way the repo
# gets onto a machine (zip copies, non-POSIX filesystems), and the build
# shouldn't depend on it.
RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY src/ src/

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
