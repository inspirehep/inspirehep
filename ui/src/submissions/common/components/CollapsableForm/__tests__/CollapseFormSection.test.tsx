import React from 'react';
import { shallow } from 'enzyme';

import CollapseFormSection from '../CollapseFormSection';

describe('CollapseFormSection', () => {
  it('renders with all props', () => {
    const wrapper = shallow(
      <CollapseFormSection header="header" key="some_key" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when header is not present', () => {
    const wrapper = shallow(<CollapseFormSection key="some_key" />);
    expect(wrapper).toMatchSnapshot();
  });
});
