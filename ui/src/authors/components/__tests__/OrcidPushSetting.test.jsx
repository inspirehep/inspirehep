import React from 'react';
import { shallow } from 'enzyme';
import { Popconfirm } from 'antd';

import OrcidPushSetting from '../OrcidPushSetting';

describe('OrcidPushSetting', () => {
  it('renders when enabled', () => {
    const wrapper = shallow(
      <OrcidPushSetting onChange={jest.fn()} isUpdating={false} enabled />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when disabled', () => {
    const wrapper = shallow(
      <OrcidPushSetting
        onChange={jest.fn()}
        isUpdating={false}
        enabled={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls on change when toggling is confirmed', () => {
    const onChange = jest.fn();
    const currentEnabled = true;
    const wrapper = shallow(
      <OrcidPushSetting
        onChange={onChange}
        isUpdating={false}
        enabled={currentEnabled}
      />
    );
    const onConfirm = wrapper.find(Popconfirm).prop('onConfirm');
    onConfirm();
    expect(onChange).toHaveBeenCalledWith(!currentEnabled);
  });
});
