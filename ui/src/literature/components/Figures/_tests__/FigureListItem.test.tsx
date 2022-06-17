import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import FigureListItem from '../FigureListItem';
import Figure from '../Figure';

<<<<<<< Updated upstream

describe('FigureListItem', () => {
  
=======
describe('FigureListItem', () => {
>>>>>>> Stashed changes
  it('renders figure list item', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_FigureListItem_1',
    });
    const wrapper = shallow(
<<<<<<< Updated upstream
      
      <FigureListItem figure={figure} onClick={jest.fn()} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
      <FigureListItem figure={figure} onClick={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('sets onClick to Figure.onClick', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_FigureListItem_1',
    });
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    const onClick = jest.fn();
    const wrapper = shallow(
      <FigureListItem figure={figure} onClick={onClick} />
    );
    const onFigureClick = wrapper.find(Figure).prop('onClick');
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(onFigureClick).toEqual(onClick);
  });
});
