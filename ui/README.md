# UI

UI for inspirehep

## Roadmap

## Dependencies

### Runtime

* react (with react-router)
* redux (with immutable sub states)
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

#### components

* use `shallow` for snapshot testing
* use `dive` with shallow for components that are wrapped by `HOC`, or to assert logic of a render prop
* do not test render results of a child component, test only props of a child component (`toHaveProp()`)
  * prefer snapshot testing unless explicit `toHaveProp()` assertion is necessary, (it is when testing function props, such as event callbacks)

#### containers

* use `mount` to render a container with a provider that has mock store.
  * example: `<Provider store={getStore({...})}>`
* wrap the container with `
* use `find(Component)` to get wrapper of the "dummy" component
* use `dummyWrapper.toHaveProp({...})` to assert `stateToProps` logic
* use `mockStore.getActions()` to assert logic of `dispatchToProps`.
  * mock action creators that are returning functions with `jest.mock` and `mockActionCreator` utility
  * call the action create instead of hard coding the action object, when creating expected actions for assertions
    * `[do(aThing)]` rather than `[{ type: 'DO', payload: { thing: aThing }}]`

### UI

* while introducing a new test, run it multiple times to validate it produces same result
* be aware of that, animations should be completed before taking the screenshot
* be aware of date dependant parts of the Page like `posted 2 days ago`, and mock Date
