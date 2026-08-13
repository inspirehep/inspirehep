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
    const { getByRole } = renderWithProviders(
      <UserSettingsModal visible onCancel={onCancel} />
    );

    getByRole('button', { name: 'Close' }).click();
    expect(onCancel).toHaveBeenCalled();
  });
});
