import React from 'react';
import { shallow } from 'enzyme';
import CitationSummaryGraph from '../CitationSummaryGraph/CitationSummaryGraph';

describe('CitationSummaryGraph', () => {
  it('renders graph with all props given', () => {
    const publishedData = [
      {
        key: '0.0-1.0',
        from: 0,
        to: 1,
        doc_count: 1,
      },
      {
        key: '1.0-50.0',
        from: 1,
        to: 50,
        doc_count: 2,
      },
      {
        key: '50.0-250.0',
        from: 50,
        to: 250,
        doc_count: 3,
      },
      {
        key: '250.0-500.0',
        from: 250,
        to: 500,
        doc_count: 4,
      },
      {
        key: '500.0-*',
        from: 500,
        doc_count: 0,
      },
    ];
    const citeableData = [
      {
        key: '0.0-1.0',
        from: 0,
        to: 1,
        doc_count: 1,
      },
      {
        key: '1.0-50.0',
        from: 1,
        to: 50,
        doc_count: 2,
      },
      {
        key: '50.0-250.0',
        from: 50,
        to: 250,
        doc_count: 3,
      },
      {
        key: '250.0-500.0',
        from: 250,
        to: 500,
        doc_count: 4,
      },
      {
        key: '500.0-*',
        from: 500,
        doc_count: 0,
      },
    ];
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={publishedData}
        citeableData={citeableData}
        loadingCitationSummary={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
