import React from 'react';
import { shallow } from 'enzyme';

import TabNameWithCount from '../TabNameWithCount';


describe('TabNameWithCount', () => {
  
  it('renders with required props', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<TabNameWithCount name="Test" />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders when loading true', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<TabNameWithCount name="Test" loading />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('does not display count if loading is true', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <TabNameWithCount name="Test" loading count={10} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('displays count if loading is false', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <TabNameWithCount name="Test" loading={false} count={10} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
