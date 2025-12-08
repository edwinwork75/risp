# Use Node.js Alpine for a lightweight image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the Prisma schema explicitly
COPY prisma ./prisma

# Copy the entire backend source code
COPY . .

RUN npx prisma generate  

# Expose backend port
EXPOSE 5001

# Start backend service
CMD ["npm", "start"]
