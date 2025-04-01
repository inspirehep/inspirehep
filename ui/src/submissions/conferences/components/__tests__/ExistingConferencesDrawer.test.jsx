import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import ExistingConferencesDrawer from '../ExistingConferencesDrawer';
import { getStore } from '../../../../fixtures/store';

describe('ExistingConferencesDrawer', () => {
  it('renders drawer with number of conferences', async () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const numberOfConferences = 5;

    const { baseElement } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/conferences']} initialIndex={0}>
          <ExistingConferencesDrawer
            visible={visible}
            onDrawerClose={onDrawerClose}
            numberOfConferences={numberOfConferences}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(baseElement).toHaveTextContent('5');
    expect(baseElement).toMatchSnapshot();
  });
});
