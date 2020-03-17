import React from 'react';
import { shallow } from 'enzyme';
import { Radio } from 'antd';

import HowToSearch, { FREETEXT_RADIO } from '../HowToSearch';

describe('HowToSearch', () => {
  it('renders with spires examples by default', () => {
    const wrapper = shallow(<HowToSearch />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders freetext examples after freetext radio option is selected', () => {
    const wrapper = shallow(<HowToSearch />);
    const changeEvent = { target: { value: FREETEXT_RADIO } };
    wrapper.find(Radio.Group).simulate('change', changeEvent);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
