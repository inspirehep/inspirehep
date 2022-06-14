import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import { act } from 'react-dom/test-utils';

import Figures from '../Figures';
import FigureListItem from '../FigureListItem';
import FiguresCarousel from '../FiguresCarousel';

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
    const wrapper = shallow(
      <Figures figures={figures} visible onCancel={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets carousel visible on list item click', () => {
    const figures = fromJS([
      {
        url: 'https://picsum.photos/200/300',
        key: 'test_1',
      },
    ]);
    const wrapper = mount(
      <Figures figures={figures} visible onCancel={jest.fn()} />
    );
    const isCarouselVisibleBefore = wrapper
      .find(FiguresCarousel)
      .prop('visible');
    expect(isCarouselVisibleBefore).toBe(false);

    const onListItemClick = wrapper.find(FigureListItem).prop('onClick');
    act(() => {
      onListItemClick();
    });
    wrapper.update();
    const isCarouselVisibleAfter = wrapper
      .find(FiguresCarousel)
      .prop('visible');
    expect(isCarouselVisibleAfter).toBe(true);
  });
});
