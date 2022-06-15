import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import { act } from 'react-dom/test-utils';

import Figures from '../Figures';
import FigureListItem from '../FigureListItem';
import FiguresCarousel from '../FiguresCarousel';


describe('Figures', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeAll'.
  beforeAll(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Window &... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ figures: any; visible: true; onCancel: any... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ figures: any; visible: true; onCancel: any... Remove this comment to see the full error message
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
