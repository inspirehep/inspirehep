# record-editor

[![Join the chat at https://gitter.im/inspirehep/record-editor](https://badges.gitter.im/inspirehep/record-editor.svg)](https://gitter.im/inspirehep/record-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://img.shields.io/travis/inveniosoftware/invenio-search-js.svg)](https://travis-ci.org/inspirehep/record-editor)
[![Release](https://img.shields.io/github/tag/inspirehep/record-editor.svg)](https://github.com/inspirehep/record-editor/releases)
[![Coverage Status](https://coveralls.io/repos/github/inspirehep/record-editor/badge.svg)](https://coveralls.io/github/inspirehep/record-editor)


Editor (used in inspirehep.net) for JSON documents with bibliographic metadata

**Still in early development**

# USAGE

## Configuration

### Extended Schema

#### x_editor_autocompletion

Configuration for autocompletion of a field from remote source. Field to be autocompleted must have the `x_editor_autocompletion` property
with configuration object that has the following properties below.

```
{
  url: string; (remote source url that returns the autocompletion results)
  path: string; (path to array of autocompletion results in response from the url, seprated by dot '.')
  size: number; (maximum number of items to be showed)
}
```

Note that:

- query string is appended to `url`, so it should end like `.../foo?bar=`
- autocompletion results array which is located in `path`, must be a array of objects which have `text` property inside.

#### x_editor_hidden

Flag to hide fields in the record from the editor's UI.

```
boolean
```

Note that:

- It deletes fields that are set `x_editor_hidden: true` from the record, before rendering the UI.

#### x_editor_disabled

Flag to disable fields that should be displayed in the UI, but aren't supposed to be edited.

```
boolean
```

#### x_editor_always_show

Flag to show fields on the UI, even if they aren't present in the record.

```
boolean
```

# DEVELOPMENT

## Tech

* Angular 2
* Webpack
* Sass
* Typescript

## Quick start
**Make sure you have Node version >= 4.0 and NPM >= 3**

```bash
# clone our repo or alternatively your fork
git clone https://github.com/inspirehep/record-editor.git

# change directory to our repo
cd record-editor

# add required global libraries
npm install typings webpack-dev-server rimraf webpack -g

# install the repo with npm
npm install

# start the server
npm start

# use Hot Module Replacement
npm run server:dev:hmr

# deploy dev build to surge (record-editor.surge.sh)
npm run surge

```
go to [http://0.0.0.0:3000](http://0.0.0.0:3000) or [http://localhost:3000](http://localhost:3000) in your browser


## Getting Started
### Dependencies
What you need to run this app:
* `node` and `npm` (`brew install node`)
* Ensure you're running the latest versions Node `v4.x.x`+ (or `v5.x.x`) and NPM `3.x.x`+

Once you have those, you should install these globals with `npm install --global`:
* `webpack` (`npm install --global webpack`)
* `webpack-dev-server` (`npm install --global webpack-dev-server`)
* `karma` (`npm install --global karma-cli`)
* `protractor` (`npm install --global protractor`)
* `typings` (`npm install --global typings`)
* `typescript` (`npm install --global typescript`)

### Installing
* `fork` this repo
* `clone` your fork
* `npm install typings webpack-dev-server rimraf webpack -g` to install required global dependencies
* `npm install` to install all dependencies
* `typings install` to install necessary typings
* `npm run server` to start the dev server in another tab

### Running the app
After you have installed all dependencies you can now run the app. Run `npm run server` to start a local server using `webpack-dev-server` which will watch, build (in-memory), and reload for you. The port will be displayed to you as `http://0.0.0.0:3000`

#### server
```bash
# development
npm run server
# production
npm run build:prod
npm run server:prod
```

### Other commands

#### build files
```bash
# development
npm run build:dev
# production
npm run build:prod
```

#### hot module replacement
```bash
npm run server:dev:hmr
```

#### watch and build files
```bash
npm run watch
```

#### run tests
```bash
npm run test
```

#### watch and run our tests
```bash
npm run watch:test
```

#### run end-to-end tests
```bash
# make sure you have your server running in another terminal
npm run e2e
```

#### run webdriver (for end-to-end)
```bash
npm run webdriver:update
npm run webdriver:start
```

#### run Protractor's elementExplorer (for end-to-end)
```bash
npm run webdriver:start
# in another terminal
npm run e2e:live
```

## Configuration
Configuration files live in `config/` we are currently using webpack, karma, and protractor for different stages of your application

## Contributing

Please see [CONTRIBUTING](./github/CONTRIBUTING.md)

## TypeScript Suggestions
> To take full advantage of TypeScript with autocomplete you would have to install it globally and use an editor with the correct TypeScript plugins.

### Use latest TypeScript compiler
TypeScript 1.7.x includes everything you need. Make sure to upgrade, even if you installed TypeScript previously.

```
npm install --global typescript
```

### Use a TypeScript-aware editor
We have good experience using these editors:

* [Visual Studio Code](https://code.visualstudio.com/)
* [Webstorm 10](https://www.jetbrains.com/webstorm/download/)
* [Atom](https://atom.io/) with [TypeScript plugin](https://atom.io/packages/atom-typescript)
* [Sublime Text](http://www.sublimetext.com/3) with [Typescript-Sublime-Plugin](https://github.com/Microsoft/Typescript-Sublime-plugin#installation)

## Typings
> When you include a module that doesn't include Type Definitions inside of the module you need to include external Type Definitions with Typings

### Use latest Typings module
```
npm install --global typings
```

### Custom Type Definitions
When including 3rd party modules you also need to include the type definition for the module
if they don't provide one within the module. You can try to install it with typings

```
typings install dt~node --save --global
```

If you can't find the type definition in the registry we can make an ambient definition in
this file for now. For example

```typescript
declare module "my-module" {
  export function doesSomething(value: string): string;
}
```


If you're prototyping and you will fix the types later you can also declare it as type any

```typescript
declare var assert: any;
declare var _: any;
declare var $: any;
```

If you're importing a module that uses Node.js modules which are CommonJS you need to import as

```typescript
import * as _ from 'lodash';
```

You can include your type definitions in this file until you create one for the typings registry
see [typings/registry](https://github.com/typings/registry)

# License
 [MIT](/LICENSE)
