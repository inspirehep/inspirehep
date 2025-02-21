import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { getStore } from '../../../fixtures/store';

import OrcidPushSetting from '../OrcidPushSetting';

describe('OrcidPushSetting', () => {
  it('renders when enabled', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <OrcidPushSetting onChange={jest.fn()} isUpdating={false} enabled />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when disabled', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <OrcidPushSetting
          onChange={jest.fn()}
          isUpdating={false}
          enabled={false}
        />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls on change when toggling is confirmed', () => {
    const onChange = jest.fn();
    const currentEnabled = true;
    const { getByText, getByRole } = render(
      <Provider store={getStore()}>
        <OrcidPushSetting
          onChange={onChange}
          isUpdating={false}
          enabled={currentEnabled}
        />
      </Provider>
    );
    getByRole('switch').click();
    getByText('OK').click();
    expect(onChange).toHaveBeenCalledWith(!currentEnabled);
  });
});
