import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import BookSeriesInfoList from '../BookSeriesInfoList';

<<<<<<< Updated upstream

describe('BookSeriesInfoList', () => {
  
=======
describe('BookSeriesInfoList', () => {
>>>>>>> Stashed changes
  it('renders many book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
      {
        title: 'Another title of book',
        volume: '2',
      },
    ]);
    const wrapper = shallow(<BookSeriesInfoList bookSeries={bookSeries} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders one book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
    ]);
    const wrapper = shallow(<BookSeriesInfoList bookSeries={bookSeries} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
