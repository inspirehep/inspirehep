import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ActionsDropdown from '../ActionsDropdown';

describe('<ActionsDropdown />', () => {
  it('renders the title with Add new and Delete buttons in the menu', async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown title="Authors" disabled={false} />);

    expect(screen.getByText('Authors')).toBeVisible();

    await user.click(screen.getByText('Authors'));

    expect(screen.getByRole('button', { name: 'Add new' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('calls the click handlers', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    const onRemoveClick = vi.fn();
    render(
      <ActionsDropdown
        title="Authors"
        disabled={false}
        onAddClick={onAddClick}
        onRemoveClick={onRemoveClick}
      />
    );

    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Add new' }));
    await user.click(screen.getByText('Authors'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
    expect(onRemoveClick).toHaveBeenCalledTimes(1);
  });

  it('hides the actions that are not allowed', async () => {
    const user = userEvent.setup();
    render(
      <ActionsDropdown
        title="Authors"
        disabled={false}
        canAdd={false}
        canRemove={false}
      />
    );

    await user.click(screen.getByText('Authors'));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not open the menu when disabled', async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown title="Authors" disabled />);

    await user.click(screen.getByText('Authors'));

    expect(
      screen.queryByRole('button', { name: 'Add new' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('does not render Upload by default', async () => {
    const user = userEvent.setup();
    render(<ActionsDropdown title="documents" disabled={false} />);

    await user.click(screen.getByText('documents'));

    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
    expect(screen.queryByTestId('documents-upload-input')).toBeNull();
  });

  it('shows Upload when canUpload and passes the selected file', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(
      <ActionsDropdown
        title="documents"
        disabled={false}
        canUpload
        onUpload={onUpload}
      />
    );

    await user.click(screen.getByText('documents'));
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();

    const file = new File(['x'], 'paper.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByTestId('documents-upload-input'), file);

    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
