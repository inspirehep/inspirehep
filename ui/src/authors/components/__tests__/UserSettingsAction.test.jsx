import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSettingsAction from '../UserSettingsAction';
import UserSettingsModal from '../UserSettingsModal';

vi.mock('../UserSettingsModal', async () => {
  const actual = await vi.importActual('../UserSettingsModal');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

vi.mock('../../containers/OrcidPushSettingContainer', async () => ({
  default: () => (
    <div data-testid="orcid-push-setting">ORCID Push Settings</div>
  ),
}));

describe('UserSettingsAction', () => {
  it('renders', () => {
    const { asFragment } = render(<UserSettingsAction />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets modal visible on click and invisible on modal cancel', async () => {
    const user = userEvent.setup();
    const screen = render(<UserSettingsAction />);

    expect(UserSettingsModal).toBeCalledWith(
      expect.objectContaining({
        visible: false,
      }),
      expect.anything()
    );

    const settingsBtn = screen.getByTestId('user-settings-button');
    await user.click(settingsBtn);

    const closeButton = screen.getByRole('button', { name: 'Close' });

    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);

    expect(UserSettingsModal).toBeCalledWith(
      expect.objectContaining({
        visible: false,
      }),
      expect.anything()
    );
  });
});
