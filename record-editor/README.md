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
yarn install --ingore-engines

# link the module
npm link

# start build with watcher
npm start
```

### On `inspire-next`

**inspire-next has to be installed correctly before starting**

* add new line: `ASSETS_DEBUG=True` in `$VIRTUAL_ENV/var/inspirehep-instance/inspirehep.cfg`
* run `./scripts/clean_assets` where `inspire-next` source code is
* run `npm link record-editor` at `$VIRTUAL_ENV/var/inspirehep-instance/static`
* run `honcho start` where `inspire-next` source code is

### On `localhost:5000/editor`

* open editor (navigate to following)
  * `/record/<type>/<recid>` to edit a record
  * `/record/<type>/search` to search records to edit
  * `/holdingpen/<workflow_id>` to edit a workflow object
  * `/multieditor` to apply edits to multiple records
* hard refresh the page whenever you want to see the changes

## Development with [inspire-next](https://github.com/inspirehep/inspire-next) using docker

### On `inspire-next`

**inspire-next has to be installed correctly before starting**

```
# Add the path to the editor in the volummes
vim services.yml
```

Add to the `volumes` list, the volume
`- "/path/to/your/editor/code:/usr/lib/node_modules/record-editor"`.

Remove all containers and start them up again:

```
docker-compose rm -f
docker-compose -f docker-compose.test.yml rm -f
docker-compose -f docker-compose.deps.yml rm -f
docker-composse up -d
```

Get a shell to the web container:

```
docker-compose exec web bash
```

### Inside the web container, under `/usr/lib/node_modules/record-editor`

NOTE: you might want to completely clean up any existing installation on the
repo, for that, you can run `git clean -fdx` inside the record-editor repo.

```bash
# install the repo with npm
yarn install --ignore-engines
```

### Inside the web container, under `/virtualenv/var/inspirehep-instance/static`

```bash
# recreate assets
/code/scripts/clean_assets

# link the custom editor
npm link record-editor
```

### Optional: inside the web container, under `/usr/lib/node_modules/record-editor`

```bash
# start build with watcher
npm start
```

If you don't do this, you'll have to manually install the editor to see any
changes you make.

# License

[GNU GPLv2](/LICENSE)
