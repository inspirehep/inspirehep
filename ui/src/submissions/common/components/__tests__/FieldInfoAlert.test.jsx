import React from 'react';
import { shallow } from 'enzyme';

import FieldInfoAlert from '../FieldInfoAlert';

describe('FieldInfoAlert', () => {
  it('renders with alert description', () => {
    const wrapper = shallow(
      <FieldInfoAlert description={<span>Watch out for this field!</span>} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
