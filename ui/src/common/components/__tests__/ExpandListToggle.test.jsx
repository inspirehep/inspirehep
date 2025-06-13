import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ExpandListToggle from '../ExpandListToggle';

describe('ExpandListToggle', () => {
  it('renders toggle size > limit', () => {
    const { getByText } = render(
      <ExpandListToggle
        size={10}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(getByText('Show all (10)')).toBeInTheDocument();
  });

  it('does not render toggle size == limit', () => {
    const { queryByRole } = render(
      <ExpandListToggle
        size={5}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('does not render toggle size < limit', () => {
    const { queryByRole } = render(
      <ExpandListToggle
        size={3}
        limit={5}
        onToggle={jest.fn()}
        expanded={false}
      />
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('renders toggle with expanded true', () => {
    const { getByText } = render(
      <ExpandListToggle size={10} limit={5} onToggle={jest.fn()} expanded />
    );
    expect(getByText('Hide')).toBeInTheDocument();
  });

  it('calls onToggle when button is clicked', async () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <ExpandListToggle size={10} limit={5} onToggle={onToggle} expanded />
    );
    const button = getByRole('button', { name: 'Hide' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });
});
