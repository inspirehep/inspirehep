import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import UserSettingsAction from '../UserSettingsAction';
import UserSettingsModal from '../UserSettingsModal';

describe('UserSettingsAction', () => {
  it('renders', () => {
    const wrapper = shallow(<UserSettingsAction />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sets modal visible on click and invisible on modal cancel', () => {
    const wrapper = shallow(<UserSettingsAction />);

    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: false,
    });

    wrapper.find(Button).simulate('click');
    wrapper.update();
    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: true,
    });

    const onModalCancel = wrapper.find(UserSettingsModal).prop('onCancel');
    onModalCancel();
    wrapper.update();
    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: false,
    });
  });
});
