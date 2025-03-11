import { mount } from 'enzyme';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStore } from '../../../../fixtures/store';
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
    const store = getStore({
      router: {
        location: {
          pathname: `/test`,
        },
      },
      ui: fromJS({
        closedBannersById,
      }),
    });
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <BannerContainer {...REQUIRED_BANNER_PROPS} />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Test')).toBeInTheDocument();
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
