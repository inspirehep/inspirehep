import React from 'react';
import { fromJS } from 'immutable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../../fixtures/store';
import DataImporterContainer from '../DataImporterContainer';
import { INITIAL_FORM_DATA_REQUEST } from '../../../../actions/actionTypes';
import DataImporter from '../../components/DataImporter';

describe('DataImporterContainer', () => {
  it('passes props from state', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        loadingInitialData: true,
        initialDataError: { message: 'Import Error' },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <DataImporterContainer onSkipClick={jest.fn()} />
      </Provider>
    );
    expect(wrapper.find(DataImporter)).toHaveProp({
      isImporting: true,
      error: fromJS({ message: 'Import Error' }),
    });
  });

  it('dispatches initial data request on import click', () => {
    const store = getStore();
    const importValue = 'arXiv:1001.1234';
    const wrapper = mount(
      <Provider store={store}>
        <DataImporterContainer onSkipClick={jest.fn()} />
      </Provider>
    );
    const onImportClick = wrapper.find(DataImporter).prop('onImportClick');
    onImportClick(importValue);

    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.id === importValue
    );
    expect(expectedAction).toBeDefined();
  });
});
