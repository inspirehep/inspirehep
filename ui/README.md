# inspire-next-react

UI for [inspirehep/inspire-next](https://github.com/inspirehep/inspire-next) built with React.

## Roadmap

- Common search components
- OpenShift integration
- Exception Dashboard
- Literature and Author Search
- ...

## Dependencies

### Runtime

- react (with react-router)
- redux (with immutable)
- ant-design

### Development

- react-scripts: provides scripts for running app in dev mode, building for prod and running tests
  - this provides all setup for webpack, babel etc.
- jest: for running unit and ui tests
- enzyme: react testing utilities
- eslint: linter for js and jsx files (uses airbnb's styleguide)
- pupeteer: for running ui tests on headless chrome (+ image snapshot testing)
- docker: ui tests are running inside docker with production build.

## Testing

__Always check existing test cases for similar things that you want to test (`Component`, `reducer`, `async action` etc.)__

- use [enzyme](), do not use `ReactTestUtils` directly.
- utilize [enzyme-matchers](https://github.com/FormidableLabs/enzyme-matchers).

## render

- prefer `mount` over `shallow` to be consistent and sure that you render what you need because often real component is wrapped with an HOC or similar,
so one level rendering is not going to be enough.
- however do not test render results of a child component, test only props of a child component (`toHaveProp()`)

### Snapshot

- use `mount` for small components.
- use `shallow` like `App` or `*Page` containers or don't use `snapshot` at all.