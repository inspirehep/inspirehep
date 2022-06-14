import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorResultItem from '../AuthorResultItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorResultItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only name', () => {
    const metadata = fromJS({
      can_edit: false,
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
    });
    const wrapper = shallow(<AuthorResultItem metadata={metadata} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders full author result', () => {
    const metadata = fromJS({
      can_edit: true,
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
      project_membership: [{ name: 'CERN-LHC-CMS' }],
      positions: [
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN2' },
        { institution: 'CERN3', current: 'true' },
      ],
      arxiv_categories: ['hep-th'],
      urls: [{ value: 'https://cern.ch/1' }],
    });
    const wrapper = shallow(<AuthorResultItem metadata={metadata} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
