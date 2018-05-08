FROM node:9.6.1 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run build

# production environment
FROM nginx:1.13.9-alpine
RUN rm -rf /etc/nginx/conf.d
COPY docker/conf /etc/nginx
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
