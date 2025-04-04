import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationsSelectAllContainer from '../PublicationsSelectAllContainer';
import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../../actions/authors';
import PublicationsSelectAll from '../../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

jest.mock('../../components/PublicationsSelectAll', () => {
  const actual = jest.requireActual('../../components/PublicationsSelectAll');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);

describe('PublicationsSelectAllContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes state to props', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
          curated_relation: true,
        },
      },
      {
        metadata: {
          control_number: 2,
          curated_relation: false,
        },
      },
    ]);
    const selection = Set([1]);
    const store = getStore({
      authors: fromJS({
        publicationSelection: selection,
        publicationsClaimedSelection: [1],
        publicationSelectionUnclaimed: [2],
      }),
      search: fromJS({
        namespaces: {
          [AUTHOR_PUBLICATIONS_NS]: {
            results: publications,
          },
        },
      }),
    });
    render(
      <Provider store={store}>
        <PublicationsSelectAllContainer />
      </Provider>
    );

    expect(PublicationsSelectAll).toHaveBeenCalledWith(
      expect.objectContaining({
        publications,
        selection,
      }),
      expect.anything()
    );
  });

  it('dispatches setSelectionMap on click', async () => {
    const selection = Set([1]);
    const store = getStore({
      authors: fromJS({
        publicationSelection: selection,
        publicationsClaimedSelection: [1],
        publicationSelectionUnclaimed: [2],
      }),
      search: fromJS({
        namespaces: {
          [AUTHOR_PUBLICATIONS_NS]: {
            results: fromJS([
              {
                metadata: {
                  control_number: 1,
                  curated_relation: true,
                  can_claim: true,
                },
              },
              {
                metadata: {
                  control_number: 2,
                  curated_relation: false,
                  can_claim: true,
                },
              },
              {
                metadata: {
                  control_number: 3,
                  curated_relation: true,
                  can_claim: false,
                },
              },
            ]),
          },
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <PublicationsSelectAllContainer />
      </Provider>
    );

    const checkbox = getByTestId('select-all-publications');
    fireEvent.click(checkbox);

    const expectedActions = [
      setPublicationSelection(fromJS([1, 2, 3]), true),
      setPublicationsUnclaimedSelection(fromJS([2]), true),
      setPublicationsClaimedSelection(fromJS([1, 3]), true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
