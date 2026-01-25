# Use an official Node runtime as a parent image
FROM node:21-slim

# Set the working directory
WORKDIR /usr/src/app
ENV VITE_API_URL=%VITE_API_URL%
ENV VITE_CLERK_PUBLISHABLE_KEY=%VITE_CLERK_PUBLISHABLE_KEY%
ENV VITE_PUSHER_APP_KEY=%VITE_PUSHER_APP_KEY%
ENV VITE_PUSHER_CLUSTER=%VITE_PUSHER_CLUSTER%
ENV PORT=5173

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (using ci for faster, deterministic installs)
RUN npm ci --legacy-peer-deps

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Build the application with placeholder values
RUN npm run build

# Set the entrypoint to run the script, and the command to serve the app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
EXPOSE 5173
