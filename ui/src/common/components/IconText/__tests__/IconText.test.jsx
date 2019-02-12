import React from 'react';
import { shallow } from 'enzyme';

import IconText from '../IconText';

describe('IconText', () => {
  it('renders with all props set', () => {
    const wrapper = shallow((
      <IconText
        type="info"
        text="Test"
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
