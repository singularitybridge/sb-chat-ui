# Use an official Node runtime as a parent image
FROM node:21-slim as build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Build the project
RUN npm run build

# Use serve to serve the static files
FROM node:21-slim
WORKDIR /usr/src/app
RUN npm install -g serve
COPY --from=build /usr/src/app/dist /usr/src/app/dist
CMD ["serve", "-s", "dist", "-l", "5173"]
EXPOSE 5173