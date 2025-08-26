import { fireEvent } from '@testing-library/react';
import { getStore } from '../../../fixtures/store';
import DisplayGuideButtonContainer from '../DisplayGuideButtonContainer';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';
import { renderWithProviders } from '../../../fixtures/render';

describe('DisplayGuideButtonContainer', () => {
  it('dispatches UI_CHANGE_GUIDE_MODAL_VISIBILITY with true, on button click', () => {
    const store = getStore();
    const { getByRole } = renderWithProviders(
      <DisplayGuideButtonContainer>
        Display the guide!!!!
      </DisplayGuideButtonContainer>,
      { store }
    );
    fireEvent.click(getByRole('button'));

    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: true },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
