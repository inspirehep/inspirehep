# inspire-next-react

Prototype UI for [inspirehep/inspire-next](https://github.com/inspirehep/inspire-next) built with React.


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