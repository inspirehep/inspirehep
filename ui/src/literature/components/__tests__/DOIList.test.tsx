import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import DOIList from '../DOIList';


describe('DOIList', () => {
  
  it('renders with dois', () => {
    const dois = fromJS([
      { value: '12.1234/1234567890123_1234' },
      {
        value: '99.9999/9999999999999_9999',
        material: 'erratum',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DOIList dois={dois} />);
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
