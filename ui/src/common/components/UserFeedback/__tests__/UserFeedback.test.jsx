import React from 'react';
import { shallow } from 'enzyme';
import { Button, Modal, Rate, Input } from 'antd';

import { trackEvent, checkIsTrackerBlocked } from '../../../../tracker';
import UserFeedback from '../UserFeedback';

jest.mock('../../../../tracker');

describe('UserFeedback', () => {
  afterEach(() => {
    trackEvent.mockClear();
    checkIsTrackerBlocked.mockClear();
  });

  it('renders', () => {
    const wrapper = shallow(<UserFeedback />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when tracker is blocked', () => {
    checkIsTrackerBlocked.mockImplementation(() => true);
    const wrapper = shallow(<UserFeedback />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sets modal visible true on feedback button click', () => {
    const wrapper = shallow(<UserFeedback />);
    wrapper.find(Button).simulate('click');
    wrapper.update();
    const modalWrapper = wrapper.find(Modal);
    expect(modalWrapper).toHaveProp('visible', true);
  });

  it('calls trackEvent with feedback on modal Ok and renders thank you', () => {
    const rateValue = 3;
    const commentValue = 'Not bad';
    const wrapper = shallow(<UserFeedback />);
    wrapper.find(Input.TextArea).prop('onChange')({
      target: { value: commentValue },
    });
    wrapper.find(Rate).prop('onChange')(rateValue);
    const onModalOk = wrapper.find(Modal).prop('onOk');
    onModalOk();
    expect(trackEvent).toHaveBeenCalledWith(
      'Feedback',
      'Main',
      commentValue,
      rateValue
    );
    expect(wrapper).toMatchSnapshot();
  });
});
