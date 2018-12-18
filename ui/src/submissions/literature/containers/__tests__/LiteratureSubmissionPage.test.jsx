import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import { getStore, getStoreWithState } from '../../../../fixtures/store';
import LiteratureSubmissionPage from '../LiteratureSubmissionPage';
import LiteratureSubmission from '../../components/LiteratureSubmission';
import * as submissions from '../../../../actions/submissions';
import DataImporterContainer from '../DataImporterContainer';

jest.mock('../../../../actions/submissions');

describe('LiteratureSubmissionPage', () => {
  it('renders with initial store state', () => {
    const store = getStore();
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with initial data and error', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        initialData: {
          title: 'Imported arXiv article',
        },
        submitError: {
          message: 'Submit Error',
        },
      }),
    });
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('displays form after skipping import', () => {
    const store = getStore();
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />).dive();
    wrapper.find(DataImporterContainer).prop('onSkipClick')();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders form after skipping import', () => {
    const store = getStore();
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />).dive();
    wrapper.find(DataImporterContainer).prop('onSkipClick')();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders different docType form when docType is changed', () => {
    const store = getStore();
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />).dive();

    // so that submission form is visible
    wrapper.setState({ hasDataImportSkipped: true });
    wrapper.update();

    wrapper
      .find('[data-test-id="document-type-select"]')
      .simulate('change', 'book');
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls submitLiterature on LiterateSubmission submit', () => {
    const store = getStore();
    const formData = {
      title: 'Test',
    };
    const mockSubmitLiterature = jest.fn();
    submissions.submitLiterature = mockSubmitLiterature;
    const wrapper = shallow(<LiteratureSubmissionPage store={store} />).dive();

    // so that submission form is visible
    wrapper.setState({ hasDataImportSkipped: true });
    wrapper.update();

    wrapper.find(LiteratureSubmission).simulate('submit', formData);
    expect(mockSubmitLiterature).toHaveBeenCalledWith(formData);
  });
});
