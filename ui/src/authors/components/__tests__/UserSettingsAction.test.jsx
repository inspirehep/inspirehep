import { fireEvent, render } from '@testing-library/react';

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

function wait(milisec = 2500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milisec);
  });
}

describe('UserSettingsAction', () => {
  it('renders', () => {
    const { asFragment } = render(<UserSettingsAction />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets modal visible on click and invisible on modal cancel', async () => {
    const screen = render(<UserSettingsAction />, { container: document.body });

    expect(UserSettingsModal).toBeCalledWith(
      expect.objectContaining({
        visible: false,
      }),
      expect.anything()
    );

    const settingsBtn = screen.getByTestId('user-settings-button');
    fireEvent.click(settingsBtn);

    await wait();

    const closeButton = screen.getByLabelText('Close');

    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    expect(UserSettingsModal).toBeCalledWith(
      expect.objectContaining({
        visible: false,
      }),
      expect.anything()
    );
  });
});
