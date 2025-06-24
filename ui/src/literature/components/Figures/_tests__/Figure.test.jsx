import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Figure from '../Figure';

jest.mock('react-image', () => ({
  Img: ({ src, alt, onClick, className }) => (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <img src={src} alt={alt} onClick={onClick} className={className} />
  ),
}));

describe('Figure', () => {
  const URL = 'https://picsum.photos/200/300';
  it('renders figure with only url', () => {
    render(<Figure url={URL} />);
    const img = screen.getByAltText('Figure');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', URL);
  });

  it('applies className, onClick and shows a caption when provided', () => {
    const onClick = jest.fn();
    const CAPTION = 'My nice figure';
    render(
      <Figure url={URL} onClick={onClick} className="h5" caption={CAPTION} />
    );

    const img = screen.getByAltText('Figure');
    expect(img).toHaveClass('h5');
    expect(screen.getByText(CAPTION)).toBeInTheDocument();
  });

  it('calls the onClick handler when the image is clicked', () => {
    const onClick = jest.fn();
    render(<Figure url={URL} onClick={onClick} />);

    const img = screen.getByAltText('Figure');
    fireEvent.click(img);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
