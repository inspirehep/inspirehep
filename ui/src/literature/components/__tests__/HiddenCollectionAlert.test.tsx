import React from 'react';
import { shallow } from 'enzyme';
import HiddenCollectionAlert from '../LiteratureCollectionBanner';


describe('HiddenCollectionAlert', () => {
  
  it('renders alert', () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ hiddenCollection: true; }' is not assignab... Remove this comment to see the full error message
    const wrapper = shallow(<HiddenCollectionAlert hiddenCollection />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
