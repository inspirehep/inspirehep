import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from '../actionTypes';
import { getStore } from '../../fixtures/store';
import { closeBanner, changeGuideModalVisibility } from '../ui';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ui - action creator', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
