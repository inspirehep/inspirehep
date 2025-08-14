import React from 'react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../../fixtures/render';

import JournalSubmissionPageContainer, {
  JournalSubmissionPage,
} from '../JournalSubmissionPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('JournalSubmissionPageContainer', () => {
  const store = getStore({
    submissions: fromJS({
      submitError: {
        message: null,
      },
    }),
  });
  it('passes props to JournalSubmissionPage', () => {
    const { queryByTestId } = renderWithProviders(
      <JournalSubmissionPageContainer />,
      { store }
    );

    expect(queryByTestId('journal-alert')).not.toBeInTheDocument();
  });

  describe('JournalSubmissionPage', () => {
    it('renders', () => {
      const { asFragment } = renderWithProviders(
        <JournalSubmissionPage error={null} onSubmit={() => {}} />,
        { store }
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
