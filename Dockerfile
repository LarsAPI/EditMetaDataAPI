### 1. Dockerfile:
```Dockerfile
# Dockerfile
FROM node:18-alpine

# Install exiftool
RUN apk add --no-cache exiftool

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
```
