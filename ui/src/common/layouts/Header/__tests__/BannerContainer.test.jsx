import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../../fixtures/store';
import BannerContainer from '../BannerContainer';
import Banner from '../Banner';
import { UI_CLOSE_BANNER } from '../../../../actions/actionTypes';

const REQUIRED_BANNER_PROPS = {
  id: 'test',
  message: 'Test',
};

describe('BannerContainer', () => {
  it('passes props from state when submissions page', () => {
    const closedBannersById = fromJS({ foo: true });
    const store = getStoreWithState({
      router: {
        location: {
          pathname: `/test`,
        },
      },
      ui: fromJS({
        closedBannersById,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <BannerContainer {...REQUIRED_BANNER_PROPS} />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Banner)).toHaveProp({
      currentPathname: '/test',
      closedBannersById,
    });
  });

  it('dispatches UI_CLOSE_BANNER with banner id, on banner close', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <BannerContainer {...REQUIRED_BANNER_PROPS} />
      </Provider>
    );
    const onBannerClose = wrapper.find(Banner).prop('onClose');
    const { id } = REQUIRED_BANNER_PROPS;
    onBannerClose(id);
    const expectedActions = [
      {
        type: UI_CLOSE_BANNER,
        payload: { id },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
