import React from 'react';
import { shallow } from 'enzyme';
import { Button, Modal, Rate, Input } from 'antd';

import { trackEvent, checkIsTrackerBlocked } from '../../../../tracker';
import UserFeedback from '../UserFeedback';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../../tracker');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('UserFeedback', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    (trackEvent as $TSFixMe).mockClear();
    (checkIsTrackerBlocked as $TSFixMe).mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(<UserFeedback />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when tracker is blocked', () => {
    (checkIsTrackerBlocked as $TSFixMe).mockImplementation(() => true);
    const wrapper = shallow(<UserFeedback />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets modal visible true on feedback button click', () => {
    const wrapper = shallow(<UserFeedback />);
    wrapper.find(Button).simulate('click');
    wrapper.update();
    const modalWrapper = wrapper.find(Modal);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(modalWrapper).toHaveProp('visible', true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls trackEvent with feedback on modal Ok and renders thank you', () => {
    const rateValue = 3;
    const commentValue = 'Not bad';
    const wrapper = shallow(<UserFeedback />);
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Input.TextArea).prop('onChange')({
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ value: string; }' is not assignable to typ... Remove this comment to see the full error message
      target: { value: commentValue },
    });
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Rate).prop('onChange')(rateValue);
    const onModalOk = wrapper.find(Modal).prop('onOk');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onModalOk();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(trackEvent).toHaveBeenCalledWith(
      'Feedback',
      'Main',
      commentValue,
      rateValue
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
