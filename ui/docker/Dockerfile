FROM node:9.6.1 as builder
WORKDIR /app
COPY . .
# Maybe is cleaner to clone the repo, make sure not to have any left overs
# RUN git clone https://github.com/inspirehep/inspirehep-ui.git .
RUN yarn install
RUN yarn run build

FROM nginx:stable-alpine
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx
RUN chgrp -R root /var/cache/nginx

EXPOSE 8081

# comment user directive as master process is run as user in OpenShift anyhow
RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
COPY docker/conf.d /etc/nginx/conf.d

RUN addgroup nginx root
USER nginx
CMD ["nginx", "-g", "daemon off;"]
