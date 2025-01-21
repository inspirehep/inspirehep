FROM registry.cern.ch/cern-sis/base-images/node:20.0.0 as build-stage

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json yarn.lock /usr/src/app/
RUN yarn install
COPY . /usr/src/app
ARG VERSION
ENV REACT_APP_VERSION="${VERSION}"
RUN yarn run build

FROM registry.cern.ch/cern-sis/base-images/inspirehep/nginx:1.19-with-vts

EXPOSE 8080
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
ARG VERSION
ENV VERSION="${VERSION}"
