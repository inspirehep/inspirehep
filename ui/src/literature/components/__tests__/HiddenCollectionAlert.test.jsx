import React from 'react';
import { shallow } from 'enzyme';
import HiddenCollectionAlert from '../LiteratureCollectionBanner';

describe('HiddenCollectionAlert', () => {
  it('renders alert', () => {
    const wrapper = shallow(<HiddenCollectionAlert hiddenCollection />);
    expect(wrapper).toMatchSnapshot();
  });
});
