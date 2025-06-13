import React from 'react';
import { goBack } from 'connected-react-router';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import GoBackLinkContainer from '../GoBackLinkContainer';

jest.mock('connected-react-router');

goBack.mockReturnValue(async () => {});

describe('GoBackLinkContainer', () => {
  afterEach(() => {
    goBack.mockClear();
  });

  it('render with custom children', () => {
    const { getByRole } = render(
      <Provider store={getStore()}>
        <GoBackLinkContainer>custom</GoBackLinkContainer>
      </Provider>
    );

    expect(getByRole('button')).toBeInTheDocument();
  });

  it('calls goBack() on click', () => {
    const store = getStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <GoBackLinkContainer />
      </Provider>
    );

    const goBackLink = getByTestId('go-back-link');
    fireEvent.click(goBackLink);

    expect(goBack).toHaveBeenCalled();
  });
});
