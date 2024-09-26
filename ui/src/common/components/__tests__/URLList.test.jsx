import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import URLList from '../URLList';

describe('URLList', () => {
  it('renders with urls', () => {
    const urls = fromJS([
      {
        value: 'url1',
      },
      {
        value: 'url2',
      },
    ]);
    const wrapper = shallow(<URLList urls={urls} />);
    expect(wrapper).toMatchSnapshot();
  });
});
