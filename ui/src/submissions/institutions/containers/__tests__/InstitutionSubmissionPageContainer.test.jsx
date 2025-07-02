import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

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
    const { queryByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <InstitutionSubmissionPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByTestId('institution-alert')).not.toBeInTheDocument();
  });

  describe('InstitutionSubmissionPage', () => {
    it('renders', () => {
      const { asFragment } = render(
        <Provider store={getStore()}>
          <MemoryRouter>
            <InstitutionSubmissionPage error={null} onSubmit={() => {}} />
          </MemoryRouter>
        </Provider>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
