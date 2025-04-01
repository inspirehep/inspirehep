import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

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
    const { queryByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <JournalSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByTestId('journal-alert')).not.toBeInTheDocument();
  });

  describe('JournalSubmissionPage', () => {
    it('renders', () => {
      const { asFragment } = render(
        <Provider store={store}>
          <MemoryRouter>
            <JournalSubmissionPage error={null} onSubmit={() => {}} />
          </MemoryRouter>
        </Provider>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
