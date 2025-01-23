import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import CurateReferenceDrawerContainer from '../CurateReferenceDrawerContainer';
import CurateReferenceDrawer from '../../components/CurateReferenceDrawer/CurateReferenceDrawer';
import { CURATE_REFERENCE_NS } from '../../../search/constants';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('CurateReferenceDrawerContainer', () => {
  it('passes state to props', () => {
    const namespace = CURATE_REFERENCE_NS;

    const store = getStoreWithState({
      literature: fromJS({
        referenceDrawer: 123456,
      }),
      search: fromJS({
        namespaces: {
          [namespace]: {
            loading: false,
          },
        },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <CurateReferenceDrawerContainer
          namespace={CURATE_REFERENCE_NS}
          recordId={1234}
          recordUuid="1234"
          revisionId={1}
        />
      </Provider>
    );

    expect(wrapper.find(CurateReferenceDrawer)).toHaveProp({
      referenceId: 123456,
      visible: true,
      loading: false,
    });
  });
});
