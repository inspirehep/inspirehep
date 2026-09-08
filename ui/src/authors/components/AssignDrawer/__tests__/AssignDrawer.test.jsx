import { Set } from 'immutable';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../fixtures/render';
import AssignDrawer from '../AssignDrawer';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn().mockReturnValue({ id: 123 }),
  };
});

describe('AssignDrawer', () => {
  it('renders assign authors search', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const screen = renderWithProviders(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );

    expect(screen.baseElement).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', async () => {
    const user = userEvent.setup();
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const { getByTestId, getByRole } = renderWithProviders(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    expect(getByTestId('assign-button')).toBeDisabled();
    await user.click(getByRole('radio', { name: 'New author' }));
    expect(getByTestId('assign-button')).toBeEnabled();

    await user.click(getByTestId('assign-button'));
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: undefined });
  });
});
