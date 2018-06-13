import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import RouteOrRedirect from '../RouteOrRedirect';

const Test = () => <div>Test Component</div>;

describe('Loading', () => {
  it('renders component if condition is true', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/test']} initialIndex={0}>
        <Switch>
          <RouteOrRedirect
            exact
            path="/test"
            condition
            component={Test}
            redirectTo="/nowhere"
          />
        </Switch>
      </MemoryRouter>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('redirects if condition is false', () => {
    const Another = () => <div>Another Component</div>;
    const wrapper = mount(
      <MemoryRouter initialEntries={['/test']} initialIndex={0}>
        <Switch>
          <Route exact path="/another" component={Another} />
          <RouteOrRedirect
            exact
            path="/test"
            condition={false}
            component={Test}
            redirectTo="/another"
          />
        </Switch>
      </MemoryRouter>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
