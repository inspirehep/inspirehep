import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'antd';

import UserSettingsAction from '../UserSettingsAction';
import UserSettingsModal from '../UserSettingsModal';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('UserSettingsAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(<UserSettingsAction />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets modal visible on click and invisible on modal cancel', () => {
    const wrapper = shallow(<UserSettingsAction />);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: false,
    });

    wrapper.find(Button).simulate('click');
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: true,
    });

    const onModalCancel = wrapper.find(UserSettingsModal).prop('onCancel');
    onModalCancel();
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(UserSettingsModal)).toHaveProp({
      visible: false,
    });
  });
});
