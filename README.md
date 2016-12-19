# record-editor

[![Join the chat at https://gitter.im/inspirehep/record-editor](https://badges.gitter.im/inspirehep/record-editor.svg)](https://gitter.im/inspirehep/record-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://img.shields.io/travis/inveniosoftware/invenio-search-js.svg)](https://travis-ci.org/inspirehep/record-editor)
[![Release](https://img.shields.io/github/tag/inspirehep/record-editor.svg)](https://github.com/inspirehep/record-editor/releases)
[![Coverage Status](https://coveralls.io/repos/github/inspirehep/record-editor/badge.svg)](https://coveralls.io/github/inspirehep/record-editor)


Editor (used in inspirehep.net) for JSON documents with bibliographic metadata

# DEVELOPMENT

## Tech

* Angular 2
* Webpack
* Sass
* Typescript
* Bootstrap 3
* [ng2-json-editor](https://github.com/inveniosoftware-contrib/ng2-json-editor)

## Quick start

```bash
# clone our repo or alternatively your fork
git clone https://github.com/inspirehep/record-editor.git

# change directory to our repo
cd record-editor

# install the repo with npm
npm install

# start the server
npm start
```
go to **http://localhost:4200/editor/:type/:recid** 

please make sure that [inspire-next](https://github.com/inspirehep/inspire-next) is running on [localhost:5000](http://localhost:5000) and
`CORS` is enabled, you many use [Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi) plugin for Chrome or
something that is equivalent for your browser.

# License
 [GNU GPLv2](/LICENSE)
