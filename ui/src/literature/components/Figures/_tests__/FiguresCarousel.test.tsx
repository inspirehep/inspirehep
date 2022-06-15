import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import FiguresCarousel from '../FiguresCarousel';

<<<<<<< Updated upstream

describe('FiguresCarousel', () => {
  
=======
describe('FiguresCarousel', () => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCancel={jest.fn()}
        ref={mockRef}
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
