import React from 'react';
import { shallow } from 'enzyme';
import { InfoOutlined } from '@ant-design/icons';

import IconText from '../IconText';


describe('IconText', () => {
  
  it('renders with all props set', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<IconText icon={<InfoOutlined />} text="Test" />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
