import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from '../author/components/Header';

describe('Header', () => {
  it('should display last edition information', () => {
    const lastRevision = {
      date: '2026-07-20T10:30:00',
      userEmail: 'jane.doe@cern.ch',
    };

    render(
      <Header
        lastRevision={lastRevision}
        onSave={vi.fn()}
        onUndo={vi.fn()}
        canUndo={false}
      />
    );

    const formattedDate = 'Jul 20, 2026, 10:30:00 AM';
    expect(
      screen.getByText(
        `Last edit on ${formattedDate} by ${lastRevision.userEmail}`
      )
    ).toBeInTheDocument();
  });

  it('should call onUndo when the undo button is clicked', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(<Header onSave={vi.fn()} onUndo={onUndo} canUndo />);

    await user.click(screen.getByRole('button', { name: /undo/i }));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('should disable the undo button when there is nothing to undo', () => {
    render(<Header onSave={vi.fn()} onUndo={vi.fn()} canUndo={false} />);

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });
});
