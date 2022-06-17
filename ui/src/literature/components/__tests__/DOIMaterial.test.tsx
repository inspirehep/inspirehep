import React from 'react';
import { shallow } from 'enzyme';

import DOIMaterial from '../DOIMaterial';

<<<<<<< Updated upstream

describe('DOIMaterial', () => {
  
  it('renders with material', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DOIMaterial material="myMaterial" />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('does not render without material', () => {
    const wrapper = shallow(<DOIMaterial />);
    
=======
describe('DOIMaterial', () => {
  it('renders with material', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DOIMaterial material="myMaterial" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render without material', () => {
    const wrapper = shallow(<DOIMaterial />);
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
