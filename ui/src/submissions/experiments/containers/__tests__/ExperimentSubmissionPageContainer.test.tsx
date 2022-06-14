import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import ExperimentSubmissionPageContainer, { ExperimentSubmissionPage } from '../ExperimentSubmissionPageContainer';

import { getStoreWithState } from '../../../../fixtures/store';

describe('ExperimentSubmissionSuccessPageContainer', () => {
  it('passes props to ExperimentSubmissionSucessPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        submitError: null,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ExperimentSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(ExperimentSubmissionPage)).toHaveProp({
      error: null,
    });
  });

  describe('ExperimentSubmissionSucessPage', () => {
    it('renders', () => {
      const component = shallow(
        <ExperimentSubmissionPage error={null} onSubmit={() => {}} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});
