import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import MoreInfo from '../MoreInfo';

describe('MoreInfo', () => {
  it('renders with urls', () => {
    const urls = fromJS([
      {
        value: 'url1',
      },
      {
        value: 'url2',
      },
    ]);
    // @ts-ignore 
    const wrapper = shallow(<MoreInfo urls={urls} />);
    expect(wrapper).toMatchSnapshot();
  });
});
