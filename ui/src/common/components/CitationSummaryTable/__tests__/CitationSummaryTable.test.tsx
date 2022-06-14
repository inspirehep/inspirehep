import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryTable from '../CitationSummaryTable';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CitationSummaryTable', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders table with only required props', () => {
    const wrapper = shallow(<CitationSummaryTable loading={false} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const renderNumberOfCiteablePapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(renderNumberOfCiteablePapers).toHaveBeenCalledWith(29);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(renderNumberOfPublishedPapers).toHaveBeenCalledWith(0);
  });
});
