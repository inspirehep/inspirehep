import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectContainer from '../LiteratureSelectContainer';
import { setLiteratureSelection } from '../../../actions/literature';

jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

describe('LiteratureSelectContainer', () => {
  it('dispatches setLiteratureSelection on change when checkbox is checked', async () => {
    const user = userEvent.setup();
    const store = getStore({
      literature: fromJS({
        literatureSelection: new Set(),
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    const expectedActions = [setLiteratureSelection([1], true)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches setLiteratureSelection with false when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    const store = getStore({
      literature: fromJS({
        literatureSelection: new Set([1]),
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    const expectedActions = [setLiteratureSelection([1], false)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('renders as checked when recordId is in literatureSelection', () => {
    const store = getStore({
      literature: fromJS({
        literatureSelection: new Set([1]),
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders as unchecked when recordId is not in literatureSelection', () => {
    const store = getStore({
      literature: fromJS({
        literatureSelection: new Set([2]),
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
