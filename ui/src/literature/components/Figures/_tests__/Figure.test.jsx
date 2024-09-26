import React from 'react';
import { shallow } from 'enzyme';
import Image from 'react-image';

import Figure from '../Figure';

describe('Figure', () => {
  it('renders figure with only url', () => {
    const url = 'https://picsum.photos/200/300';
    const wrapper = shallow(<Figure url={url} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders figure with all props', () => {
    const url = 'https://picsum.photos/200/300';
    const wrapper = shallow(
      <Figure url={url} onClick={jest.fn()} className="h5" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets onClick to Image.onClick', () => {
    const url = 'https://picsum.photos/200/300';
    const onClick = jest.fn();
    const wrapper = shallow(<Figure url={url} onClick={onClick} />);
    const onImageClick = wrapper.find(Image).prop('onClick');
    expect(onImageClick).toEqual(onClick);
  });
});
