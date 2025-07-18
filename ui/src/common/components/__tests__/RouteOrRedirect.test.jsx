import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { renderWithRouter } from '../../../fixtures/render';
import RouteOrRedirect from '../RouteOrRedirect';

const Test = () => <div>Test Component</div>;

describe('RouteOrRedirect', () => {
  it('renders component if condition is true', () => {
    const { getByText } = renderWithRouter(
      <Switch>
        <RouteOrRedirect
          exact
          path="/test"
          condition
          component={Test}
          redirectTo="/nowhere"
        />
      </Switch>,
      { route: '/test' }
    );
    expect(getByText('Test Component')).toBeInTheDocument();
  });

  it('redirects if condition is false', () => {
    const Another = () => <div>Another Component</div>;
    const { queryByText, getByText } = renderWithRouter(
      <Switch>
        <Route exact path="/another" component={Another} />
        <RouteOrRedirect
          exact
          path="/test"
          condition={false}
          component={Test}
          redirectTo="/another"
        />
      </Switch>,
      { route: '/test' }
    );

    expect(getByText('Another Component')).toBeInTheDocument();
    expect(queryByText('Test Component')).toBeNull();
  });
});
