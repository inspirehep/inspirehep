import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';

import { getStore } from '../../../../fixtures/store';
import DataImporterContainer from '../DataImporterContainer';
import { INITIAL_FORM_DATA_REQUEST } from '../../../../actions/actionTypes';

describe('DataImporterContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      submissions: fromJS({
        loadingInitialData: true,
        initialDataError: { message: 'Import Error' },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <DataImporterContainer onSkipClick={jest.fn()} />
      </Provider>
    );

    expect(getByTestId('data-importer-error')).toHaveTextContent(
      'Import Error'
    );
  });

  it('dispatches initial data request on import click', async () => {
    const store = getStore();
    const importValue = 'arXiv:1001.1234';

    const { getByTestId } = render(
      <Provider store={store}>
        <DataImporterContainer onSkipClick={jest.fn()} />
      </Provider>
    );

    const importInput = getByTestId('import-input');
    const importButton = getByTestId('import-button');

    await userEvent.type(importInput, importValue);
    await userEvent.click(importButton);

    const actions = store.getActions();
    const expectedAction = actions.find(
      (action) =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.id === importValue
    );

    expect(expectedAction).toBeDefined();
  });
});
