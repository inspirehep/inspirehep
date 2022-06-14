import React from 'react';
import { shallow } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Route } from 'react-router-dom';

import SafeSwitch from '../SafeSwitch';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SafeSwitch', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders childrens and redirect to errors', () => {
    const Foo = () => <div>Foo Component</div>;
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2559) FIXME: Type '{ children: Element; }' has no properties in... Remove this comment to see the full error message
      <SafeSwitch>
        <Route path="/foo" component={Foo} />
      </SafeSwitch>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
