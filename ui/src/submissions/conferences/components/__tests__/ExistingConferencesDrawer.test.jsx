import React from 'react';

import { renderWithProviders } from '../../../../fixtures/render';
import ExistingConferencesDrawer from '../ExistingConferencesDrawer';

describe('ExistingConferencesDrawer', () => {
  it('renders drawer with number of conferences', async () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const numberOfConferences = 5;

    const { baseElement } = renderWithProviders(
      <ExistingConferencesDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        numberOfConferences={numberOfConferences}
      />,
      { route: '/submissions/conferences' }
    );

    expect(baseElement).toHaveTextContent('5');
    expect(baseElement).toMatchSnapshot();
  });
});
