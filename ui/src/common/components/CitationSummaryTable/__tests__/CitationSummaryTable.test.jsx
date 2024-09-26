import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryTable from '../CitationSummaryTable';

describe('CitationSummaryTable', () => {
  it('renders table without render props', () => {
    const citeableBucket = fromJS({
      doc_count: 29000,
      citations_count: {
        value: 29128,
      },
      average_citations: {
        value: 4.12345,
      },
    });
    const publishedBucket = fromJS({
      doc_count: 0,
      citations_count: {
        value: 20723,
      },
      average_citations: {
        value: 9,
      },
    });
    const hIndex = fromJS({
      value: {
        all: 1067,
        published: 9,
      },
    });
    const wrapper = shallow(
      <CitationSummaryTable
        publishedBucket={publishedBucket}
        citeableBucket={citeableBucket}
        hIndex={hIndex}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders table with only required props', () => {
    const wrapper = shallow(<CitationSummaryTable loading={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders table with null numbers', () => {
    const citeableBucket = fromJS({
      doc_count: null,
      citations_count: {
        value: null,
      },
      average_citations: {
        value: null,
      },
    });
    const publishedBucket = fromJS({
      doc_count: null,
      citations_count: {
        value: null,
      },
      average_citations: {
        value: null,
      },
    });
    const hIndex = fromJS({
      value: {
        all: 1067,
        published: 9,
      },
    });
    const wrapper = shallow(
      <CitationSummaryTable
        publishedBucket={publishedBucket}
        citeableBucket={citeableBucket}
        hIndex={hIndex}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls render props', () => {
    const citeableBucket = fromJS({
      doc_count: 29,
      citations_count: {
        value: 2,
      },
      average_citations: {
        value: 4.12345,
      },
    });
    const publishedBucket = fromJS({
      doc_count: 0,
      citations_count: {
        value: 20,
      },
      average_citations: {
        value: 9,
      },
    });
    const hIndex = fromJS({
      value: {
        all: 8,
        published: 9,
      },
    });
    const renderNumberOfCiteablePapers = jest.fn();
    const renderNumberOfPublishedPapers = jest.fn();
    mount(
      <CitationSummaryTable
        publishedBucket={publishedBucket}
        citeableBucket={citeableBucket}
        hIndex={hIndex}
        loading
        error={fromJS({ message: 'Error' })}
        renderNumberOfCiteablePapers={renderNumberOfCiteablePapers}
        renderNumberOfPublishedPapers={renderNumberOfPublishedPapers}
      />
    );
    expect(renderNumberOfCiteablePapers).toHaveBeenCalledWith(29);
    expect(renderNumberOfPublishedPapers).toHaveBeenCalledWith(0);
  });
});
