import React from 'react';
import { shallow } from 'enzyme';

import UnclickableTag from '../UnclickableTag';


describe('UnclickableTag', () => {
  
  it('renders with all props set', () => {
    const wrapper = shallow(
      <UnclickableTag
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        className="this-is-a-test-class"
        color="blue"
        visible
        closable
      >
        This is a tag
      </UnclickableTag>
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders without props', () => {
    const wrapper = shallow(<UnclickableTag>This is a tag</UnclickableTag>);
    
    expect(wrapper).toMatchSnapshot();
  });
});
