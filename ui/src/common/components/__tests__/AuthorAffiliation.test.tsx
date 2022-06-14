import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Affiliation from '../Affiliation';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Affiliation', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders linked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unlinked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders linked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unlinked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
