import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureItem from '../LiteratureItem';

describe('LiteratureItem', () => {
  it('renders with all props set, including sub props', () => {
    const metadata = fromJS({
      titles: [
        { title: 'test' },
      ],
      authors: [
        { full_name: 'Test, Author' },
      ],
      arxiv_eprints: [
        { value: '1234567890' },
      ],
      control_number: 12345,
      citation_count: 1,
      publicaion_info: [
        { journal_title: 'Test Jornal' },
      ],
      dois: [
        { value: '12345679.1234.123' },
      ],
      report_numbers: [
        { value: 'ABCD-AB-CD-1234-123' },
      ],
      abstract: [
        { value: 'Test Abstract' },
      ],
    });
    const display = fromJS({
      date: 'Jun 7, 1993',
      number_of_references: 2,
    });
    const wrapper = shallow((
      <LiteratureItem metadata={metadata} display={display} />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render citation and reference count if they are missing', () => {
    const metadata = fromJS({
      control_number: 12345,
    });
    const display = fromJS({});
    const wrapper = shallow((
      <LiteratureItem metadata={metadata} display={display} />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render cite, citation count and reference count if control_number is missing', () => {
    const metadata = fromJS({
      citation_count: 1,
    });
    const display = fromJS({
      number_of_references: 2,
    });
    const wrapper = shallow((
      <LiteratureItem metadata={metadata} display={display} />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('does not arxiv pdf download action if there is no eprint value', () => {
    const metadata = fromJS({
      control_number: 12345,
    });
    const display = fromJS({});
    const wrapper = shallow((
      <LiteratureItem metadata={metadata} display={display} />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
