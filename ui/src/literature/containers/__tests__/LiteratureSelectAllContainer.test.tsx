import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectAllContainer from '../LiteratureSelectAllContainer';
import { setLiteratureSelection } from '../../../actions/literature';
import LiteratureSelectAll from '../../components/LiteratureSelectAll';
import { LITERATURE_NS } from '../../../search/constants';

jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

describe('LiteratureSelectAllContainer', () => {
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
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );
    expect(wrapper.find(LiteratureSelectAll)).toHaveProp({
      publications,
      selection,
    });
  });

  it('dispatches setSelectionMap on click', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );
    wrapper.find(LiteratureSelectAll).prop('onChange')([1, 2, 3], true);
    const expectedActions = [setLiteratureSelection([1, 2, 3], true)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
