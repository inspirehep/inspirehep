import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import SubscribeJobsForm from '../SubscribeJobsForm';

describe('SubscribeJobsForm', () => {
  it('renders', () => {
    const wrapper = shallow(<SubscribeJobsForm onSubmit={jest.fn()} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', () => {
    const onSubmit = jest.fn();
    const data = {
      email: 'harun@cern.ch',
      first_name: 'Harun',
      last_name: 'Urhan',
    };
    const wrapper = shallow(<SubscribeJobsForm onSubmit={onSubmit} />);

    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    onFormikSubmit(data);
    expect(onSubmit).toHaveBeenCalledWith(data);
  });
});
