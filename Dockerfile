# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set security labels
LABEL security.hardened="true" \
      security.non-root="true"

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the application code
COPY . .

# Change ownership of the application directory to the non-root node user
RUN chown -R node:node /usr/src/app

# Switch to the non-root user for security
USER node

# Expose port
EXPOSE 3000

# Add container healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]
