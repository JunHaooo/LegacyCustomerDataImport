# Use the official Node.js Long Term Support image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying package.json AND package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Create the uploads folder (required for Multer)
RUN mkdir -p uploads

# The app binds to port 3000
EXPOSE 3000

# Start the application
CMD [ "node", "src/app.js" ]