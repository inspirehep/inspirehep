FROM nginx:1.17-alpine
EXPOSE 8080

WORKDIR /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist .


ARG VERSION
ENV VERSION="${VERSION}"
