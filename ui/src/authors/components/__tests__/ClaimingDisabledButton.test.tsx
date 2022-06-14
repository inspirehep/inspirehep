import React from 'react';
import { shallow } from 'enzyme';
import ClaimingDisabledButton from '../ClaimingDisabledButton';

describe('ClaimingDisabledButton', () => {
  it('renders', () => {
    const wrapper = shallow(<ClaimingDisabledButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
