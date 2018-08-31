import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureItem from '../LiteratureItem';

describe('LiteratureItem', () => {
  it('renders with all props set, including sub props', () => {
    const metadata = fromJS({
      date: 'Jun 7, 1993',
      number_of_references: 2,
      titles: [{ title: 'test' }],
      authors: [{ full_name: 'Test, Author' }],
      arxiv_eprints: [{ value: '1234567890' }],
      control_number: 12345,
      citation_count: 1,
      publicaion_info: [{ journal_title: 'Test Jornal' }],
      dois: [{ value: '12345679.1234.123' }],
      report_numbers: [{ value: 'ABCD-AB-CD-1234-123' }],
      abstract: [{ value: 'Test Abstract' }],
    });
    const wrapper = shallow(<LiteratureItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not arxiv pdf download action if there is no eprint value', () => {
    const metadata = fromJS({
      control_number: 12345,
    });
    const wrapper = shallow(<LiteratureItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders 0 citations and 0 references if they do not exist', () => {
    const metadata = fromJS({
      control_number: 12345,
    });
    const wrapper = shallow(<LiteratureItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
