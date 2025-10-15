import React from 'react';

export const TicketsList = ({ tickets }) => {
  if (!tickets) return null;

  return (
    <>
      <p className="mb0">See related tickets</p>
      <ul className="mb0">
        {tickets.map((ticket) => {
          const id = ticket.get('ticket_id');
          const url = ticket.get('ticket_url');
          return (
            <li className="mb0" key={id}>
              <a href={url} target="_blank" rel="noreferrer noopener">
                #{id}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};
