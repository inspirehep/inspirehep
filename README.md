# record-editor

[![Join the chat at https://gitter.im/inspirehep/record-editor](https://badges.gitter.im/inspirehep/record-editor.svg)](https://gitter.im/inspirehep/record-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://img.shields.io/travis/inveniosoftware/invenio-search-js.svg)](https://travis-ci.org/inspirehep/record-editor)
[![Release](https://img.shields.io/github/tag/inspirehep/record-editor.svg)](https://github.com/inspirehep/record-editor/releases)
[![Coverage Status](https://coveralls.io/repos/github/inspirehep/record-editor/badge.svg)](https://coveralls.io/github/inspirehep/record-editor)


Editor (used in inspirehep.net) for JSON documents with bibliographic metadata

# DEVELOPMENT

## Tech

* Angular
* Webpack
* Sass
* Typescript
* Bootstrap 3
* [ng2-json-editor](https://github.com/inveniosoftware-contrib/ng2-json-editor)

## Development with [inspire-next](https://github.com/inspirehep/inspire-next)


### On `record-editor`

```bash
# install the repo with npm
npm install

# link the module
npm link

# start build with watcher
npm start
```

### On `inspire-next`
__inspire-next has to be installed correctly before starting__

- add new line: `ASSETS_DEBUG=True` in `$VIRTUAL_ENV/var/inspirehep-instance/inspirehep.cfg`
- run `./scripts/clean_assets` where `inspire-next` source code is
- run `npm link record-editor` at `$VIRTUAL_ENV/var/inspirehep-instance/static`
- run `honcho start` where `inspire-next` source code is

### On `localhost:5000`

- open editor with any record or workflow object
- hard refresh the page whenever you want to see the changes


# License
 [GNU GPLv2](/LICENSE)
