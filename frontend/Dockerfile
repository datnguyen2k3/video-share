# Build Stage
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS production
WORKDIR /app

# Copy built output from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/package*.json ./
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
EXPOSE 3001

# Start Next.js server
CMD ["npm", "run", "start"]
