import React from 'react';
import { shallow } from 'enzyme';
import SeminarCountWarning from '../SeminarCountWarning';

describe('SeminarCountWarning', () => {
  it('renders', () => {
    const wrapper = shallow(<SeminarCountWarning />);
    expect(wrapper).toMatchSnapshot();
  });
});
