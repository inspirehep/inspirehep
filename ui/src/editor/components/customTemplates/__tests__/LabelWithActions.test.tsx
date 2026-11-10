import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LabelWithActions from '../LabelWithActions';

describe('<LabelWithActions />', () => {
  it('renders the title with Add new and Delete buttons', () => {
    render(<LabelWithActions title="Authors" disabled={false} />);

    expect(screen.getByText('Authors')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add new' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });

  it('calls the click handlers', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    const onRemoveClick = vi.fn();
    render(
      <LabelWithActions
        title="Authors"
        disabled={false}
        onAddClick={onAddClick}
        onRemoveClick={onRemoveClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add new' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
    expect(onRemoveClick).toHaveBeenCalledTimes(1);
  });

  it('hides the buttons that are not allowed', () => {
    render(
      <LabelWithActions
        title="Authors"
        disabled={false}
        canAdd={false}
        canRemove={false}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables the buttons when disabled', () => {
    render(<LabelWithActions title="Authors" disabled />);

    expect(screen.getByRole('button', { name: 'Add new' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('shows Upload only when canUpload and passes the selected file', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const { rerender } = render(
      <LabelWithActions title="documents" disabled={false} />
    );
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();

    rerender(
      <LabelWithActions
        title="documents"
        disabled={false}
        canUpload
        onUpload={onUpload}
      />
    );
    const file = new File(['x'], 'paper.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByTestId('documents-upload-input'), file);

    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
