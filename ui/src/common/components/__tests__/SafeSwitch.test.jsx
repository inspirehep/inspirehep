import { Route, Switch } from 'react-router-dom';

import { renderWithRouter } from '../../../fixtures/render';
import SafeSwitch from '../SafeSwitch';

describe('SafeSwitch', () => {
  it('renders children ', () => {
    const Foo = () => <div>Foo Component</div>;
    const { getByText } = renderWithRouter(
      <SafeSwitch>
        <Switch>
          <Route path="/foo" component={Foo} />
        </Switch>
      </SafeSwitch>,
      { route: '/foo' }
    );
    expect(getByText('Foo Component')).toBeInTheDocument();
  });

  it('redirect to errors', () => {
    const Foo = () => <div>Foo Component</div>;
    const { container } = renderWithRouter(
      <SafeSwitch>
        <Switch>
          <Route path="/foo" component={Foo} />
        </Switch>
      </SafeSwitch>,
      { route: '/bad_route' }
    );
    expect(container).toBeEmptyDOMElement();
  });
});
