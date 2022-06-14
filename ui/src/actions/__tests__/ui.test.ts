import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from '../actionTypes';
import { getStore } from '../../fixtures/store';
import { closeBanner, changeGuideModalVisibility } from '../ui';

describe('ui - action creator', () => {
  it('closeBanner creates UI_CLOSE_BANNER', async () => {
    const id = 'test-01';
    const expectedActions = [
      {
        type: UI_CLOSE_BANNER,
        payload: { id },
      },
    ];

    const store = getStore();
    await store.dispatch(closeBanner(id));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('changeGuideModalVisibility creates UI_CHANGE_GUIDE_MODAL_VISIBILITY', async () => {
    const visibility = true;
    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility },
      },
    ];

    const store = getStore();
    await store.dispatch(changeGuideModalVisibility(visibility));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
