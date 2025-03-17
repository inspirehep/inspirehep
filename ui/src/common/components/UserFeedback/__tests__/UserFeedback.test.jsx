import { render } from '@testing-library/react';
import { Modal, Rate, Input } from 'antd';

import { shallow } from 'enzyme';
import { trackEvent, checkIsTrackerBlocked } from '../../../../tracker';
import UserFeedback from '../UserFeedback';

jest.mock('../../../../tracker');

describe('UserFeedback', () => {
  afterEach(() => {
    trackEvent.mockClear();
    checkIsTrackerBlocked.mockClear();
  });

  it('renders when tracker is blocked', () => {
    checkIsTrackerBlocked.mockImplementation(() => true);
    const { getByText, getByRole } = render(<UserFeedback />);

    getByRole('button').click();
    expect(getByText('AdBlock detected')).toBeInTheDocument();
  });

  it('sets modal visible true on feedback button click', () => {
    const { getByTestId, getByRole } = render(<UserFeedback />);
    getByRole('button').click();
    expect(getByTestId('user-feedback')).toBeInTheDocument();
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
      'Feedback modal',
      'Feedback submission',
      `Feedback comment: ${commentValue}`,
      rateValue
    );
    expect(wrapper).toMatchSnapshot();
  });
});
