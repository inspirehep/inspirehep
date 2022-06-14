import { fromJS } from 'immutable';

import reducer from '../ui';
import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ui reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('UI_CLOSE_BANNER', () => {
    const currentState = fromJS({
      closedBannersById: {},
    });
    const action = { type: UI_CLOSE_BANNER, payload: { id: 'test' } };
    const state = reducer(currentState, action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.getIn(['closedBannersById', 'test'])).toEqual(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('UI_CHANGE_GUIDE_MODAL_VISIBILITY', () => {
    const currentState = fromJS({
      guideModalVisibility: null,
    });
    const action = {
      type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
      payload: { visibility: true },
    };
    const state = reducer(currentState, action);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('guideModalVisibility')).toEqual(true);
  });
});
