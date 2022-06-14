import React from 'react';
import { shallow } from 'enzyme';
import HiddenCollectionAlert from '../LiteratureCollectionBanner';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('HiddenCollectionAlert', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders alert', () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ hiddenCollection: true; }' is not assignab... Remove this comment to see the full error message
    const wrapper = shallow(<HiddenCollectionAlert hiddenCollection />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
