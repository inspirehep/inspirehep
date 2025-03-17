import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import DisplayGuideButtonContainer from '../DisplayGuideButtonContainer';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';

describe('DisplayGuideButtonContainer', () => {
  it('dispatches UI_CHANGE_GUIDE_MODAL_VISIBILITY with true, on button click', () => {
    const store = getStore();
    const { getByRole } = render(
      <Provider store={store}>
        <DisplayGuideButtonContainer>
          Display the guide!!!!
        </DisplayGuideButtonContainer>
      </Provider>
    );
    getByRole('button').click();

    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: true },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
