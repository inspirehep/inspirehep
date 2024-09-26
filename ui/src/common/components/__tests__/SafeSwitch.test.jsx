import React from 'react';
import { shallow } from 'enzyme';
import { Route } from 'react-router-dom';

import SafeSwitch from '../SafeSwitch';

describe('SafeSwitch', () => {
  it('renders childrens and redirect to errors', () => {
    const Foo = () => <div>Foo Component</div>;
    const wrapper = shallow(
      <SafeSwitch>
        <Route path="/foo" component={Foo} />
      </SafeSwitch>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
