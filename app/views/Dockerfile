# Use the Nginx image as the base
FROM nginx:alpine

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the frontend files to the default Nginx directory
COPY . /usr/share/nginx/html

# Expose port 80 to serve the files
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
