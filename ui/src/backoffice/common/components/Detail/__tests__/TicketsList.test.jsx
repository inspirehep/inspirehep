import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fromJS } from 'immutable';
import { TicketsList } from '../TicketsList';

describe('<TicketsList />', () => {
  it('renders nothing when tickets is null', () => {
    const { container } = render(<TicketsList tickets={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ticket links when tickets has items (Immutable.List of Maps)', () => {
    const tickets = fromJS([
      { ticket_id: '123', ticket_url: 'https://example.com/t/123' },
      { ticket_id: '999', ticket_url: 'https://example.com/t/999' },
    ]);

    render(<TicketsList tickets={tickets} />);

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    const link1 = screen.getByText('#123');
    const link2 = screen.getByText('#999');
    expect(link1).toHaveAttribute('href', 'https://example.com/t/123');
    expect(link2).toHaveAttribute('href', 'https://example.com/t/999');

    [link1, link2].forEach((a) => {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noreferrer noopener');
    });
  });
});
