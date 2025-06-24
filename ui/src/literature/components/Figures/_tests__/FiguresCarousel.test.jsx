import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import FiguresCarousel from '../FiguresCarousel';

describe('FiguresCarousel', () => {
  beforeAll(() => {
    const rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'root');
    document.body.appendChild(rootElement);
  });

  it('renders with all props', () => {
    const figures = fromJS([
      {
        url: 'https://picsum.photos/200/300',
        key: 'test_FiguresCarousel_1',
      },
    ]);
    const mockRef = React.createRef();
    render(
      <FiguresCarousel
        figures={figures}
        visible
        onCancel={jest.fn()}
        ref={mockRef}
      />
    );

    const modalContent = document.querySelector('.__CarouselModal__');
    expect(modalContent).toBeInTheDocument();
    expect(modalContent).toMatchSnapshot();
  });
});
