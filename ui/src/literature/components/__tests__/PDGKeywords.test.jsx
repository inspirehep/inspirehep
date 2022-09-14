import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { PDGKeywords } from '../PDGKeywords.tsx';

describe('PDGKeywords', () => {
  it('renders with keywords', () => {
    const keywords = fromJS([
      {
        value: 'Q007TP',
        description: 'Test description'
      },
      {
        value: '2137',
        description: 'test'
      },
    ]);
    const wrapper = shallow(<PDGKeywords keywords={keywords} />);
    expect(wrapper).toMatchSnapshot();
  });
});
