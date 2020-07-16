import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationsSelectAllContainer from '../PublicationsSelectAllContainer';
import { setPulicationSelection } from '../../../actions/authors';
import PublicationsSelectAll from '../../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

jest.mock('../../../actions/authors');
mockActionCreator(setPulicationSelection);

describe('PublicationsSelectAllContainer', () => {
  it('passes state to props', () => {
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
      authors: fromJS({
        publicationSelection: selection,
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
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationsSelectAllContainer />
      </Provider>
    );
    wrapper.find(PublicationsSelectAll).prop('onChange')([1, 2, 3], true);
    const expectedActions = [setPulicationSelection([1, 2, 3], true)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
