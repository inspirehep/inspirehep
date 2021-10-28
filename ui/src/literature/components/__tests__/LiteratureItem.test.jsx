import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureItem from '../LiteratureItem';

describe('LiteratureItem', () => {
  it('renders with all props set, including sub props', () => {
    const metadata = fromJS({
      date: 'Jun 7, 1993',
      titles: [{ title: 'test' }],
      authors: [{ full_name: 'Test, Author' }],
      arxiv_eprints: [{ value: '1234567890' }],
      fulltext_links: [{ value: 'https://fulltext.cern/pdf/1' }],
      urls: [{ value: 'http://lss.fnal.gov/conf/C8206282/pg209.pdf' }],
      control_number: 12345,
      citation_count: 12435,
      publication_info: [{ journal_title: 'Test Jornal' }],
      collaborations: [{ value: 'CMS' }],
      collaborations_with_suffix: [{ value: 'CMS Group' }],
      conference_info: [
        {
          acronyms: ['MG15', 'SAP16'],
          titles: [
            {
              title:
                '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
            },
          ],
        },
      ],
    });
    const wrapper = shallow(
      <LiteratureItem metadata={metadata} searchRank={2} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not arxiv pdf download action if there is no eprint value', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
    });
    const wrapper = shallow(
      <LiteratureItem metadata={metadata} searchRank={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders 0 citations if it does not exist', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
    });
    const wrapper = shallow(
      <LiteratureItem metadata={metadata} searchRank={2} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders publication info when book exists but publication title not', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
      publication_info: [
        {
          year: 2021,
          journal_volume: '9783030795993',
        },
      ],
      document_type: ['book'],
      book_series: [
        {
          title: 'SpringerBriefs in Physics',
        },
      ],
    });
    const wrapper = shallow(
      <LiteratureItem metadata={metadata} searchRank={3} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
