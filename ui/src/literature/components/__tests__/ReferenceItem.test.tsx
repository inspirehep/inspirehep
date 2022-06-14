import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceItem from '../ReferenceItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ReferenceItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with full reference', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      arxiv_eprints: [{ value: '123456' }],
      control_number: 12345,
      label: 123,
      authors: [{ full_name: 'Author' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unlinked reference (no control_number)', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      authors: [{ full_name: 'Author' }],
      arxiv_eprints: [{ value: '123456' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders misc if present', () => {
    const reference = fromJS({
      misc: 'A Misc',
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render misc if title present', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
