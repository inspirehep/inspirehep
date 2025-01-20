import React from 'react';
import { render } from '@testing-library/react';
import PrivateNotes from '../PrivateNotes';

describe('PrivateNotes', () => {
  const mockPrivateNotes = [
    { get: (key: string) => (key === 'value' ? 'Note 1' : null) },
    { get: (key: string) => (key === 'value' ? 'Note 2' : null) },
  ];

  it('renders private notes correctly', () => {
    const { getByText } = render(
      <PrivateNotes privateNotes={mockPrivateNotes} />
    );

    expect(getByText('Notes')).toBeInTheDocument();
    expect(getByText('"Note 1"')).toBeInTheDocument();
    expect(getByText('"Note 2"')).toBeInTheDocument();
  });
});
