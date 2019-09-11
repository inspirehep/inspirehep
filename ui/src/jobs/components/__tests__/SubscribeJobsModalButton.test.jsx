import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'antd';

import SubscribeJobsModalButton from '../SubscribeJobsModalButton';
import subscribeJobMailingList from '../../subscribeJobMailingList';
import LinkLikeButton from '../../../common/components/LinkLikeButton';

jest.mock('../../subscribeJobMailingList');

describe('SubscribeJobsModalButton', () => {
  it('renders with initial state', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sets modal visible on button click', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    wrapper.find(LinkLikeButton).prop('onClick')();
    expect(wrapper.find(Modal).prop('visible')).toBe(true);
  });

  it('renders with error alert if hasError', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    wrapper.setState({ hasError: true });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders confirmation if subscription is submitted', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    wrapper.setState({ isSubscriptionSubmitted: true });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls subscribeJobMailingList with filled data on modal OK click', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    wrapper.find('Input[name="email"]').prop('onChange')({
      target: { name: 'email', value: 'harun@cern.ch' },
    });
    wrapper.find('Input[name="firstName"]').prop('onChange')({
      target: { name: 'firstName', value: 'Harun' },
    });
    wrapper.find('Input[name="lastName"]').prop('onChange')({
      target: { name: 'lastName', value: 'Urhan' },
    });

    const onModalOKClick = wrapper.find(Modal).prop('onOk');
    onModalOKClick();

    expect(subscribeJobMailingList).toHaveBeenCalledWith({
      email: 'harun@cern.ch',
      firstName: 'Harun',
      lastName: 'Urhan',
    });
    expect(wrapper.find(Modal).prop('visible')).toBe(false);
  });
});
