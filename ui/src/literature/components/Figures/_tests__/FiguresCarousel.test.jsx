import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import FiguresCarousel from '../FiguresCarousel';

describe('FiguresCarousel', () => {
  it('renders with all props', () => {
    const figures = fromJS([
      {
        url: 'https://picsum.photos/200/300',
        key: 'test_FiguresCarousel_1',
      },
    ]);
    const mockRef = { current: null };
    const wrapper = shallow(
      <FiguresCarousel
        figures={figures}
        visible
        onCancel={jest.fn()}
        ref={mockRef}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
