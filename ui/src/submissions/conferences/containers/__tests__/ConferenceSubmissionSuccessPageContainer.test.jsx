import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import ConferenceSubmissionSuccessPageContainer, {
  ConferenceSubmissionSucessPage,
} from '../ConferenceSubmissionSuccessPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('ConferenceSubmissionSuccessPageContainer', () => {
  const store = getStore({
    submissions: fromJS({
      successData: {
        pid_value: 12345,
        cnum: 'C19-02-01',
      },
    }),
  });

  it('passes props to ConferenceSubmissionSucessPage', () => {
    const { getByText, getByRole } = render(
      <Provider store={store}>
        <MemoryRouter>
          <ConferenceSubmissionSuccessPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(
      getByText(/Successfully submitted, thank you for the submission!/i)
    ).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/conferences/12345');
    expect(getByText(/C19-02-01/i)).toBeInTheDocument();
  });

  describe('ConferenceSubmissionSucessPage', () => {
    it('renders', () => {
      const { asFragment } = render(
        <Provider store={store}>
          <MemoryRouter>
            <ConferenceSubmissionSucessPage cnum="C19-02-01" recordId={12345} />
          </MemoryRouter>
        </Provider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
