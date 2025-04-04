import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import UserSettingsModal from '../UserSettingsModal';
import { getStore } from '../../../fixtures/store';

describe('UserSettingsModal', () => {
  it('renders with props', () => {
    const onCancel = jest.fn();
    const screen = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <UserSettingsModal visible onCancel={onCancel} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onCancel on modal cancel', () => {
    const onCancel = jest.fn();
    const { getByLabelText } = render(
      <Provider store={getStore()}>
        <UserSettingsModal visible onCancel={onCancel} />
      </Provider>
    );

    getByLabelText('Close').click();
    expect(onCancel).toHaveBeenCalled();
  });
});
