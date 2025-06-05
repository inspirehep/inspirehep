import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import PublicationInfo from '../PublicationInfo';

describe('PublicationInfo', () => {
  it('renders with journal_title present', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
    });
    const { getByText } = render(<PublicationInfo info={info} />);
    getByText(/Test Journal/i);
  });

  it('renders with journal_title and all others fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      year: 2016,
      page_start: '1',
      page_end: '2',
      artid: '012345',
    });
    const { getByText, queryByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/Test Journal/i)).toBeInTheDocument();
    expect(getByText(/TV/i)).toBeInTheDocument();
    expect(getByText(/\(2016\)/i)).toBeInTheDocument();
    expect(getByText(/1-2/i)).toBeInTheDocument();
    expect(queryByText(/012345/i)).toBeNull();
  });

  it('renders with journal_title and all others fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      year: 2016,
      page_start: '1',
      page_end: '2',
      artid: '012345',
      pubinfo_freetext: 'Test. Pub. Info. Freetext',
    });
    const { getByText, queryByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/Test Journal/i)).toBeInTheDocument();
    expect(getByText(/TV/i)).toBeInTheDocument();
    expect(getByText(/\(2016\)/i)).toBeInTheDocument();
    expect(getByText(/1-2/i)).toBeInTheDocument();
    expect(queryByText(/Test. Pub. Info. Freetext/i)).toBeNull();
  });

  it('renders with pubinfo_freetext', () => {
    const info = fromJS({
      pubinfo_freetext: 'Test. Pub. Info. Freetext',
    });
    const { getByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/Test. Pub. Info. Freetext/i)).toBeInTheDocument();
  });

  it('renders without pubinfo_freetext or journal_title', () => {
    const info = fromJS({});
    const { container } = render(<PublicationInfo info={info} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders with material', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      material: 'erratum',
    });
    const { getByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/\(erratum\)/i)).toBeInTheDocument();
  });

  it('does not render material if it is publication', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      material: 'publication',
    });
    const { queryByText } = render(<PublicationInfo info={info} />);
    expect(queryByText(/\(publication\)/i)).toBeNull();
  });

  it('renders either page start/end or artid', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      page_start: 1,
      page_end: 10,
      artid: 123,
      journal_issue: 2,
    });

    const { getByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/1-10/i)).toBeInTheDocument();
  });

  it('renders only page_start when page_end is not available', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      page_start: 1,
      artid: 123,
      journal_issue: 2,
    });
    const { getByText } = render(<PublicationInfo info={info} />);
    expect(getByText(/1/i)).toBeInTheDocument();
    expect(getByText(/,/i)).toBeInTheDocument();
  });

  it('does not display a comma when page info or artid is not available', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_issue: 2,
    });
    const { queryByText } = render(<PublicationInfo info={info} />);
    expect(queryByText(/,/i)).toBeNull();
  });
});
