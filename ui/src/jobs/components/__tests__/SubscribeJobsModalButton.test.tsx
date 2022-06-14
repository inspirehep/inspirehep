import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'antd';

import SubscribeJobsModalButton from '../SubscribeJobsModalButton';
import subscribeJobMailingList from '../../subscribeJobMailingList';
import LinkLikeButton from '../../../common/components/LinkLikeButton';
import SubscribeJobsForm from '../SubscribeJobsForm';

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

  it('sets isSubscriptionSubmitted false after modal is closed', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    wrapper.setState({ isSubscriptionSubmitted: true });

    const afterModalClose = wrapper.find(Modal).prop('afterClose');
    afterModalClose();

    expect(wrapper).toHaveState({ isSubscriptionSubmitted: false });
  });

  it('calls subscribeJobMailingList on SubscribeJobsFrom submit', () => {
    const wrapper = shallow(<SubscribeJobsModalButton />);

    const onSubscribeFormSubmit = wrapper
      .find(SubscribeJobsForm)
      .prop('onSubmit');
    const data = {
      email: 'harun@cern.ch',
      first_name: 'Harun',
      last_name: 'Urhan',
    };
    onSubscribeFormSubmit(data);
    expect(subscribeJobMailingList).toHaveBeenCalledWith(data);
    expect(wrapper.find(Modal).prop('visible')).toBe(false);
  });
});
