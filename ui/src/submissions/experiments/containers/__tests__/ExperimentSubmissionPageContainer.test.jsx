import React from 'react';

import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import ExperimentSubmissionPageContainer, {
  ExperimentSubmissionPage,
} from '../ExperimentSubmissionPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('ExperimentSubmissionSuccessPageContainer', () => {
  it('passes props to ExperimentSubmissionSucessPage', () => {
    const store = getStore({
      submissions: fromJS({
        submitError: null,
      }),
    });
    const { queryByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <ExperimentSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByTestId('experiment-alert')).not.toBeInTheDocument();
  });

  describe('ExperimentSubmissionSucessPage', () => {
    it('renders', () => {
      const { asFragment } = render(
        <Provider store={getStore()}>
          <MemoryRouter>
            <ExperimentSubmissionPage error={null} onSubmit={() => {}} />
          </MemoryRouter>
        </Provider>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
