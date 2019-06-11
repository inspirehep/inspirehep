import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import { getStore, getStoreWithState } from '../../../../fixtures/store';
import JobSubmissionPage from '../JobSubmissionPage';
import JobSubmission from '../../components/JobSubmission';
import * as submissions from '../../../../actions/submissions';

jest.mock('../../../../actions/submissions');

describe('JobSubmissionPage', () => {
  it('renders with initial store state', () => {
    const store = getStore();
    const wrapper = shallow(<JobSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with error', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        submitError: {
          message: 'Submit Error',
        },
      }),
    });
    const wrapper = shallow(<JobSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('calls submit on JobSubmission submit', () => {
    const store = getStore();
    const formData = {
      name: 'Test',
    };
    const mockSubmit = jest.fn();
    submissions.submit = mockSubmit;
    const wrapper = shallow(<JobSubmissionPage store={store} />).dive();

    wrapper.find(JobSubmission).simulate('submit', formData);
    expect(mockSubmit).toHaveBeenCalledWith('jobs', formData);
  });
});
