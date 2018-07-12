import React from 'react';
import { shallow, mount } from 'enzyme';
import { Map } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import { INSPECT_REQUEST } from '../../../actions/actionTypes';
import InspectPage from '../InspectPage';

const matchProps = {
  params: {
    id: 123,
  },
};

describe('Inspect Page', () => {
  it('renders initial state', () => {
    const store = getStoreWithState({
      inspect: Map({
        loading: false,
        data: Map({
          head: { value: 'head' },
          update: { value: 'update' },
          root: { value: 'root' },
          merged: { value: 'merged' },
        }),
      }),
    });

    const wrapper = shallow(<InspectPage match={matchProps} store={store} />)
      .dive()
      .dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches inspect page', () => {
    const store = getStoreWithState({
      inspect: Map({
        loading: false,
        data: Map({
          head: {},
          update: {},
          root: {},
          merged: {},
        }),
      }),
    });
    mount(<InspectPage match={matchProps} store={store} />);
    const actions = store.getActions();
    expect(actions.some(action => action.type === INSPECT_REQUEST)).toBe(true);
  });

  // TODO: test loading: true
});
