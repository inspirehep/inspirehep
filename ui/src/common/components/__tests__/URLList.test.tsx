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
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<URLList urls={urls} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
