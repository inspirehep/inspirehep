import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import Image from 'react-image';

import Figure from '../Figure';

describe('Figure', () => {
  it('renders figure without label and caption', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_figure_1',
    });
    const wrapper = shallow(<Figure figure={figure} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders figure with label and caption and all props', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_figure_1',
      label: 'Test Figure 01',
      caption: 'This is a test figure, for the cool literature to reference',
    });
    const wrapper = shallow(
      <Figure figure={figure} onClick={jest.fn()} className="h5" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets onClick to Image.onClick', () => {
    const figure = fromJS({
      url: 'https://picsum.photos/200/300',
      key: 'test_figure_1',
    });
    const onClick = jest.fn();
    const wrapper = shallow(<Figure figure={figure} onClick={onClick} />);
    const onImageClick = wrapper.find(Image).prop('onClick');
    expect(onImageClick).toEqual(onClick);
  });
});
