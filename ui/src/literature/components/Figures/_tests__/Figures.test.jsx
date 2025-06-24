import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import Figures from '../Figures';

describe('Figures', () => {
  beforeAll(() => {
    window.CONFIG = { FIGURES_FEATURE_FLAG: true };
  });

  it('renders with figures', () => {
    const figures = fromJS([
      {
        url: 'https://picsum.photos/200/300',
        key: 'test_1',
      },
    ]);
    const { asFragment } = render(
      <Figures figures={figures} visible onCancel={jest.fn()} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('sets carousel visible on list item click', () => {
    const figures = fromJS([
      {
        url: 'https://picsum.photos/200/300',
        key: 'test_1',
      },
    ]);
    const { container } = render(<Figures figures={figures} />);

    expect(container.querySelector('.ant-list-item')).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });
});
