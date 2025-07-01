import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectAllContainer from '../LiteratureSelectAllContainer';
import { setLiteratureSelection } from '../../../actions/literature';
import { LITERATURE_NS } from '../../../search/constants';

jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

describe('LiteratureSelectAllContainer', () => {
  it('renders checkbox as checked when all publications are selected', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1, 2]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders checkbox as unchecked when no publications are selected', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders checkbox as unchecked when only some publications are selected', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('dispatches setLiteratureSelection with all publication IDs when checkbox is checked', async () => {
    const user = userEvent.setup();
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
      {
        metadata: {
          control_number: 3,
        },
      },
    ]);
    const selection = Set([]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const expectedActions = [setLiteratureSelection(fromJS([1, 2, 3]), true)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches setLiteratureSelection with all publication IDs when checkbox is unchecked', async () => {
    const user = userEvent.setup();
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1, 2]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const expectedActions = [setLiteratureSelection(fromJS([1, 2]), false)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('handles empty publications list', () => {
    const publications = fromJS([]);
    const selection = Set([]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
