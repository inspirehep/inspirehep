import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import ExperimentSubmissionSuccessPageContainer, { ExperimentSubmissionSucessPage } from '../ExperimentSubmissionSuccessPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';

describe('ExperimentSubmissionSuccessPageContainer', () => {
  it('passes props to ExperimentSubmissionSucessPage', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        successData: {
          control_number: 12345,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ExperimentSubmissionSuccessPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(ExperimentSubmissionSucessPage)).toHaveProp({
      recordId: 12345,
    });
  });

  describe('ExperimentSubmissionSucessPage', () => {
    it('renders', () => {
      const component = shallow(
        <ExperimentSubmissionSucessPage recordId={12345} />
      );
      expect(component).toMatchSnapshot();
    });
  });
});
