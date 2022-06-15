import React from 'react';
import { shallow } from 'enzyme';
import GridLink from '../GridLink';

describe('GridLink', () => {
  it('renders', () => {
    const grid = 'grid123';
    const wrapper = shallow(<GridLink grid={grid} />);
    expect(wrapper).toMatchSnapshot();
  });
});
