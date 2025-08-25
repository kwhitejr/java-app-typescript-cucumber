FROM node:22-alpine

# Install Java (required for OpenAPI generator)
RUN apk add --no-cache openjdk17-jre

WORKDIR /app

# Copy the OpenAPI spec
COPY openapi.yaml ../openapi.yaml

# Copy package files first for better caching
COPY test-automation/package*.json ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy all test automation files (excludes are handled by .dockerignore)
COPY test-automation/ ./

# Generate API types and build
RUN npm run generate:api && npm run build

ENTRYPOINT ["npm", "test"]