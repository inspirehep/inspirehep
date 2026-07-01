import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../fixtures/render';
import { getStore } from '../../../fixtures/store';

import OrcidPushSetting from '../OrcidPushSetting';

describe('OrcidPushSetting', () => {
  it('renders when enabled', () => {
    const { asFragment } = renderWithProviders(
      <OrcidPushSetting onChange={jest.fn()} isUpdating={false} enabled />,
      { store: getStore() }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when disabled', () => {
    const { asFragment } = renderWithProviders(
      <OrcidPushSetting
        onChange={jest.fn()}
        isUpdating={false}
        enabled={false}
      />,
      { store: getStore() }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls on change when toggling is confirmed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const currentEnabled = true;
    const { getByText, getByRole } = renderWithProviders(
      <OrcidPushSetting
        onChange={onChange}
        isUpdating={false}
        enabled={currentEnabled}
      />,
      { store: getStore() }
    );
    await user.click(getByRole('switch'));
    await user.click(getByText('OK'));
    expect(onChange).toHaveBeenCalledWith(!currentEnabled);
  });
});
