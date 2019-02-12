# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM nginx:stable

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y curl
RUN apt-get install -y gnupg2

WORKDIR /tmp
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

WORKDIR /app/ui
COPY ui .
# We invalidate cache always because there is no easy way for now to detect
# if something in the whole git repo changed. For docker git clone <url> <dir>
# is always the same so it caches it.
ARG CACHE_DATE=not_a_date

RUN yarn install
RUN yarn run build
RUN cp -r /app/ui/build/* /usr/share/nginx/html

EXPOSE 8080

COPY docker/nginx/conf.d /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]
