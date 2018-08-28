import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationItem from '../CitationItem';

describe('CitationItem', () => {
  it('renders with full citation', () => {
    const citation = fromJS({
      titles: [{ title: 'Title' }],
      control_number: 12345,
      authors: [{ full_name: 'Author' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
    });
    const wrapper = shallow(<CitationItem citation={citation} />);
    expect(wrapper).toMatchSnapshot();
  });
});
