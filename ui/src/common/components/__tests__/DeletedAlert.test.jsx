import React from 'react';
import { shallow } from 'enzyme';
import DeletedAlert from '../DeletedAlert';

describe('DeletedAlert', () => {
  it('renders DeletedAlert with correct type and message', () => {
    const wrapper = shallow(<DeletedAlert />);
    expect(wrapper).toMatchSnapshot();
  });
});
