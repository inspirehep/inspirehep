import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import FiguresCarousel from '../FiguresCarousel';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('FiguresCarousel', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ figures: any; visible: true; onCancel: any... Remove this comment to see the full error message
        figures={figures}
        visible
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onCancel={jest.fn()}
        ref={mockRef}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
