import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PaginationContainer from '../PaginationContainer';
import { LITERATURE_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('PaginationContainer', () => {
  const namespace = LITERATURE_NS;
  it('passes page, size and total from search namespace state', () => {
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { page: '2', size: '10' },
            total: 100,
          },
        },
      }),
    });
    const { getByText, container } = render(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );

    const element = container.querySelector('.ant-pagination-item-active');
    expect(element.textContent).toBe('2');
    expect(getByText('10 / page')).toBeInTheDocument();
  });

  it('dispatcheds searchQueryUpdate onPageChange', async () => {
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { page: '1', size: '10' },
            total: 100,
          },
        },
      }),
    });

    const screen = render(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );

    fireEvent.click(screen.getByTitle('Next Page'));

    const expectedActions = [searchQueryUpdate(namespace, { page: '2' })];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches searchQueryUpdate onSizeChange', async () => {
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { page: '1', size: '10' },
            total: 100,
          },
        },
      }),
    });

    const screen = render(
      <Provider store={store}>
        <PaginationContainer namespace={namespace} />
      </Provider>
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('25 / page'));

    const expectedActions = [
      searchQueryUpdate(namespace, { size: 25, page: '1' }),
    ];
    await waitFor(() =>
      expect(store.getActions()).toEqual(
        expect.arrayContaining(expectedActions)
      )
    );
  });
});
