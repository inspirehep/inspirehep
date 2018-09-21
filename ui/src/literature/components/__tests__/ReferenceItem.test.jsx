import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceItem from '../ReferenceItem';

describe('ReferenceItem', () => {
  it('renders with full reference', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      arxiv_eprints: [{ value: '123456' }],
      control_number: 12345,
      authors: [{ full_name: 'Author' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

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
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders misc if present', () => {
    const reference = fromJS({
      misc: 'A Misc',
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render misc if title present', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
    });
    const wrapper = shallow(<ReferenceItem reference={reference} />);
    expect(wrapper).toMatchSnapshot();
  });
});
