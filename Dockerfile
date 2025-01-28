FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN bun i

# Install Prisma Client if not already installed
RUN bun add @prisma/client

# Copy the rest of your application
COPY . .

# Expose the port
EXPOSE 4000

# Set environment variable for production
ENV NODE_ENV=production

# Generate Prisma client
RUN bunx prisma generate

# Run the server when the container launches
CMD ["bun", "server.js"]
