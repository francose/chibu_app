# Build Stage
FROM node:21.5-alpine3.19 as build
WORKDIR /app
COPY ./devsecapp_assistant_app/package.json ./
RUN npm install
COPY ./devsecapp_assistant_app/ ./
RUN npm run build

# Node.js Stage - for running Next.js server
FROM node:21.5-alpine3.19 as nextjs-server
WORKDIR /app
COPY --from=build /app/ ./
EXPOSE 3001
CMD ["npm","run", "start" ]

# Nginx Stage - as a reverse proxy
FROM nginx:1.16.0-alpine as nginx-server
COPY ./devsecapp_assistant_app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
