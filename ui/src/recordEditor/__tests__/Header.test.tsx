import { render, screen } from '@testing-library/react';

import Header from '../author/components/Header';

describe('Header', () => {
  it('should display search bar with control number of the record and last edition information', () => {
    const lastRevision = {
      date: '2026-07-20T10:30:00',
      userEmail: 'jane.doe@cern.ch',
    };

    render(<Header lastRevision={lastRevision} onSave={vi.fn()} />);

    const formattedDate = 'Jul 20, 2026, 10:30:00 AM';
    expect(
      screen.getByText(
        `Last edit on ${formattedDate} by ${lastRevision.userEmail}`
      )
    ).toBeInTheDocument();
  });
});
