import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import FigureListItem from '../FigureListItem';

describe('FigureListItem', () => {
  it('renders figure list item', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_FigureListItem_1',
    });
    const { asFragment } = render(
      <FigureListItem figure={figure} onClick={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets onClick to Figure.onClick', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_FigureListItem_1',
    });
    const onClick = jest.fn();

    const { container } = render(
      <FigureListItem figure={figure} onClick={onClick} />
    );

    expect(container.firstChild).toBeInTheDocument();

    const listItem = container.querySelector('.ant-list-item');
    expect(listItem).toBeInTheDocument();

    expect(typeof onClick).toBe('function');
  });
});
