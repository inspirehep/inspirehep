import React from 'react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../../fixtures/render';

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
    const { queryByTestId } = renderWithProviders(
      <ExperimentSubmissionPageContainer />,
      { store }
    );

    expect(queryByTestId('experiment-alert')).not.toBeInTheDocument();
  });

  describe('ExperimentSubmissionSucessPage', () => {
    it('renders', () => {
      const { asFragment } = renderWithProviders(
        <ExperimentSubmissionPage error={null} onSubmit={() => {}} />,
        { store: getStore() }
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
