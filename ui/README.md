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

### render

- prefer `mount` over `shallow` to be consistent and sure that you render what you need.
- however do not test render results of a child component, test only props of a child component (`toHaveProp()`)
  - prefer snapshot testing unless explicit `toHaveProp()` assertion is necessary.

### snapshot

- firstly be aware that what is generated, and see it has things that you want to asssert.
- use `mount` for small components and wrapper containers
- use `shallow` like `App` or `*Page` containers to assert things like props passed correctly etc.
  - do not wrap component with `<Provider>` but pass `store` as prop to directly and `.dive()`