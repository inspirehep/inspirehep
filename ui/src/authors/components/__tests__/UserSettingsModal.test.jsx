import React from 'react';
import UserSettingsModal from '../UserSettingsModal';
import { renderWithProviders } from '../../../fixtures/render';

describe('UserSettingsModal', () => {
  it('renders with props', () => {
    const onCancel = jest.fn();
    const screen = renderWithProviders(
      <UserSettingsModal visible onCancel={onCancel} />
    );

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onCancel on modal cancel', () => {
    const onCancel = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <UserSettingsModal visible onCancel={onCancel} />
    );

    getByLabelText('Close').click();
    expect(onCancel).toHaveBeenCalled();
  });
});
