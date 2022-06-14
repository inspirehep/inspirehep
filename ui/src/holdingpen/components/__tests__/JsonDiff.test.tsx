import React from 'react';
import { shallow } from 'enzyme';

import JsonDiff from '../JsonDiff';

describe('JsonDiff', () => {
  it('renders diff', () => {
    const first = {
      id: 1,
      foo: 'bar',
      another: 'value',
    };
    const second = {
      id: 2,
      foo: 'not bar',
    };
    const wrapper = shallow(<JsonDiff first={first} second={second} />);
    expect(wrapper).toMatchSnapshot();
  });
});
