import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationsSelectAllContainer from '../PublicationsSelectAllContainer';
import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
} from '../../../actions/authors';
import PublicationsSelectAll from '../../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);
mockActionCreator(setPublicationsUnclaimedSelection);
mockActionCreator(setPublicationsCanNotClaimSelection);

describe('PublicationsSelectAllContainer', () => {
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
    const wrapper = mount(
      <Provider store={store}>
        <PublicationsSelectAllContainer />
      </Provider>
    );
    expect(wrapper.find(PublicationsSelectAll)).toHaveProp({
      publications,
      selection,
    });
  });

  it('dispatches setSelectionMap on click', () => {
    const selection = Set([1]);
    const store = getStore({
      authors: fromJS({
        publicationSelection: selection,
        publicationsClaimedSelection: [1],
        publicationSelectionUnclaimed: [2],
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <PublicationsSelectAllContainer />
      </Provider>
    );
    wrapper.find(PublicationsSelectAll).prop('onChange')(
      [1, 2, 3],
      fromJS([true, false, true]),
      fromJS([true, true, false]),
      true
    );
    const expectedActions = [
      setPublicationSelection([1, 2, 3], true),
      setPublicationsUnclaimedSelection([2], true),
      setPublicationsClaimedSelection([1, 3], true),
      setPublicationsCanNotClaimSelection([3], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
