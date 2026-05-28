# Stage 1: Build the backend application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and download dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package skipping tests
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the production JRE runner image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the compiled JAR artifact from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose backend application port
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
