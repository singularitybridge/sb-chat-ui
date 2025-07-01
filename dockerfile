# Use an official Node runtime as a parent image
FROM node:21-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Set the entrypoint to run the script, and the command to serve the app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "5173"]
EXPOSE 5173
