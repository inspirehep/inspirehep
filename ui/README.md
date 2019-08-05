# UI

UI for inspirehep

## Roadmap

## Dependencies

### Runtime

* react (with react-router)
* redux (with immutable)
* ant-design

### Development

* react-scripts: provides scripts for running app in dev mode, building for prod and running tests
  * this provides all setup for webpack, babel etc.
* jest: for running unit and ui tests
* enzyme: react testing utilities
* eslint: linter for js and jsx files (uses airbnb's styleguide)
* pupeteer: for running ui tests on headless chrome (+ image snapshot testing)
* docker: ui tests are running inside docker with production build.

## Testing

### Unit

**Always check existing test cases for similar things that you want to test (`Component`, `reducer`, `async action` etc.)**

* use [enzyme](https://airbnb.io/enzyme), do not use `ReactTestUtils` directly.
* utilize [enzyme-matchers](https://github.com/FormidableLabs/enzyme-matchers).

#### render

* prefer `shallow` over `mount`, for snapshot testing
* use `dive` with shallow for components that are wrapped by `HOC`
* do not test render results of a child component, test only props of a child component (`toHaveProp()`)
  * prefer snapshot testing unless explicit `toHaveProp()` assertion is necessary, (it is when testing function props)

### UI

* while introducing a new test, run it multiple times to validate it produces same result
* be aware of that, animations should be completed before taking the screenshot
* be aware of date dependant parts of the Page like `posted 2 days ago`, and mock Date
