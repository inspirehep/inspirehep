import React from 'react';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';

import InstitutionSubmissionPageContainer, {
  InstitutionSubmissionPage,
} from '../InstitutionSubmissionPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('InstitutionSubmissionPageContainer', () => {
  it('passes props to InstitutionSubmissionPage', () => {
    const store = getStore({
      submissions: fromJS({
        submitError: null,
      }),
    });
    const { queryByTestId } = renderWithProviders(
      <InstitutionSubmissionPageContainer />,
      { store }
    );

    expect(queryByTestId('institution-alert')).not.toBeInTheDocument();
  });

  describe('InstitutionSubmissionPage', () => {
    it('renders', () => {
      const { asFragment } = renderWithProviders(
        <InstitutionSubmissionPage error={null} onSubmit={() => {}} />,
        { store: getStore() }
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
