import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceItem from '../ReferenceItem';

describe('ReferenceItem', () => {
  it('renders with full reference', () => {
    const reference = fromJS({
      title: 'Title',
      recid: 12345,
      authors: [{ full_name: 'Author' }],
      publication_info: {
        journal_title: 'Journal',
      },
      dois: [{ value: '123456.12345' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders unlinked reference (no recid)', () => {
    const reference = fromJS({
      title: 'Title',
      authors: [{ full_name: 'Author' }],
      publication_info: {
        journal_title: 'Journal',
      },
      dois: [{ value: '123456.12345' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
