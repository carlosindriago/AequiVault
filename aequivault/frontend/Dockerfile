# Stage 1: Build the Angular frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency descriptors and lock files
COPY package*.json ./

# Install packages using clean install
RUN npm ci

# Copy frontend source code
COPY . .

# Compile Angular SPA application for production
RUN npx ng build --configuration production

# Stage 2: Run the production server via Nginx
FROM nginx:1.25-alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA static files
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
