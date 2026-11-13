# ===================================================================
# Multi-Stage Dockerfile for Spring Boot 3 Backend
# ===================================================================
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper & POM
COPY pom.xml .
COPY src ./src

# Build production JAR without tests
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/smart-inventory-system-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
