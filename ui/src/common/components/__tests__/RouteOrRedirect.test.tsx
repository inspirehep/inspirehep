import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import RouteOrRedirect from '../RouteOrRedirect';

const Test = () => <div>Test Component</div>;

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RouteOrRedirect', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders component if condition is true', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/test']} initialIndex={0}>
        <Switch>
          <RouteOrRedirect
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exact: true; path: string; condition: true... Remove this comment to see the full error message
            exact
            path="/test"
            condition
            component={Test}
            redirectTo="/nowhere"
          />
        </Switch>
      </MemoryRouter>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('redirects if condition is false', () => {
    const Another = () => <div>Another Component</div>;
    const wrapper = mount(
      <MemoryRouter initialEntries={['/test']} initialIndex={0}>
        <Switch>
          <Route exact path="/another" component={Another} />
          <RouteOrRedirect
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ exact: true; path: string; condition: fals... Remove this comment to see the full error message
            exact
            path="/test"
            condition={false}
            component={Test}
            redirectTo="/another"
          />
        </Switch>
      </MemoryRouter>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
