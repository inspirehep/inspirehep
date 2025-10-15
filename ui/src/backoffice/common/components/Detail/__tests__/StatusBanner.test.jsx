import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBanner } from '../StatusBanner';

describe('<StatusBanner />', () => {
  it('renders nothing when status is falsy', () => {
    const { container } = render(<StatusBanner status={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders known status text and correct base classes', () => {
    render(<StatusBanner status="completed" />);

    expect(screen.getByText('Completed')).toBeInTheDocument();

    const bannerDiv = screen.getByText('Completed').closest('div');
    expect(bannerDiv).toHaveClass('bg-completed');
    expect(bannerDiv).toHaveClass('w-100');
    expect(bannerDiv).not.toHaveClass('white');
  });

  it('adds "white" class for error status and shows correct text', () => {
    render(<StatusBanner status="error" />);

    expect(screen.getByText('Error')).toBeInTheDocument();

    const bannerDiv = screen.getByText('Error').closest('div');
    expect(bannerDiv).toHaveClass('bg-error');
    expect(bannerDiv).toHaveClass('white');
  });
});
