import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'antd';

import UserSettingsModal from '../UserSettingsModal';

describe('UserSettingsModal', () => {
  it('renders with props', () => {
    const wrapper = shallow(<UserSettingsModal visible onCancel={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCancel on modal cancel', () => {
    const onCancel = jest.fn();
    const wrapper = shallow(<UserSettingsModal visible onCancel={onCancel} />);
    const onModalCancel = wrapper.find(Modal).prop('onCancel');
    onModalCancel();
    expect(onCancel).toHaveBeenCalled();
  });
});
