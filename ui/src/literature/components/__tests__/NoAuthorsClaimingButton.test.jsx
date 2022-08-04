import React from 'react';
import { shallow } from 'enzyme';
import NoAuthorsClaimingButton from '../NoAuthorsClaimingButton';

describe('NoAuthorsClaimingButton', () => {
  it('renders', () => {
    const wrapper = shallow(<NoAuthorsClaimingButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
