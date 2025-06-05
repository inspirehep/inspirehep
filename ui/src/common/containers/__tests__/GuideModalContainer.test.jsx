import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';

import { getStore } from '../../../fixtures/store';
import GuideModalContainer from '../GuideModalContainer';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';

function wait(milisec = 2500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milisec);
  });
}

describe('GuideModalContainer', () => {
  beforeAll(() => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  });

  afterAll(() => {
    const root = document.getElementById('root');
    if (root) {
      document.body.removeChild(root);
    }
  });

  it('passes visibility to GuideModal', async () => {
    const store = getStore({
      ui: fromJS({
        guideModalVisibility: false,
      }),
    });
    const screen = render(
      <Provider store={store}>
        <GuideModalContainer />
      </Provider>
    );

    await wait();

    expect(screen.queryByText('Welcome to INSPIRE!')).not.toBeInTheDocument();
  });

  it('dispatches UI_CHANGE_GUIDE_MODAL_VISIBILITY with false, on modal cancel', async () => {
    const store = getStore({
      ui: fromJS({
        guideModalVisibility: true,
      }),
    });

    const screen = render(
      <Provider store={store}>
        <MemoryRouter>
          <GuideModalContainer />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: false },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
