import { render, screen, within } from '@testing-library/react';
import { fromJS } from 'immutable';
import userEvent from '@testing-library/user-event';

import Figures from '../Figures';

vi.mock('react-image', () => ({
  Img: ({ src, alt, onClick, className }) => (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <img src={src} alt={alt} onClick={onClick} className={className} />
  ),
}));

vi.mock('../FiguresCarousel', () => ({
  default: ({ visible, initialIndex }) =>
    visible ? <div data-testid="carousel" data-index={initialIndex} /> : null,
}));

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

  it.each(['0', '1', '2'])(
    'displays clicked figure on list item %s click',
    async (figureIndex) => {
      const user = userEvent.setup();
      const figures = fromJS([
        {
          url: 'https://picsum.photos/200/300',
          key: 'test_1',
        },
        {
          url: 'https://picsum.photos/200/400',
          key: 'test_2',
        },
        {
          url: 'https://picsum.photos/200/500',
          key: 'test_3',
        },
      ]);
      render(<Figures figures={figures} />);

      const secondFigure = await screen.findByTestId(`figure-${figureIndex}`);
      await user.click(within(secondFigure).getByRole('img'));
      expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-index',
        figureIndex
      );
    }
  );
});
