import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import { getStore, getStoreWithState } from '../../../../fixtures/store';
import AuthorSubmissionPage from '../AuthorSubmissionPage';
import AuthorSubmission from '../../components/AuthorSubmission';
import * as submissions from '../../../../actions/submissions';

jest.mock('../../../../actions/submissions');

describe('AuthorSubmissionPage', () => {
  it('renders with initial store state', () => {
    const store = getStore();
    const wrapper = shallow(<AuthorSubmissionPage store={store} />);
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
    const wrapper = shallow(<AuthorSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with query', () => {
    const store = getStoreWithState({
      router: { location: { query: { bai: 'P.Carenza.1' } } },
    });
    const wrapper = shallow(<AuthorSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('calls submitAuthor on AuthorSubmission submit', () => {
    const store = getStore();
    const formData = {
      name: 'Test',
    };
    const mockSubmitAuthor = jest.fn();
    submissions.submitAuthor = mockSubmitAuthor;
    const wrapper = shallow(<AuthorSubmissionPage store={store} />).dive();

    wrapper.find(AuthorSubmission).simulate('submit', formData);
    expect(mockSubmitAuthor).toHaveBeenCalledWith(formData);
  });
});
