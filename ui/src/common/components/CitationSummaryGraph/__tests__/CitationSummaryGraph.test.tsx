import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore } from '../../../../fixtures/store';
import CitationSummaryGraph, {
  Bar,
  HOVERED_BLUE,
} from '../CitationSummaryGraph';
import { CITEABLE_BAR_TYPE } from '../../../constants';

describe('CitationSummaryGraph', () => {
  const store = getStore();

  const testData = {
    publishedData: [
      {
        key: '0--0',
        from: 1,
        to: 1,
        doc_count: 1,
      },
      {
        key: '1--50',
        from: 1,
        to: 50,
        doc_count: 2,
      },
      {
        key: '50--250',
        from: 50,
        to: 250,
        doc_count: 3,
      },
      {
        key: '250--500',
        from: 250,
        to: 500,
        doc_count: 4,
      },
      {
        key: '--500',
        from: 500,
        doc_count: 1,
      },
    ],
    citeableData: [
      {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 1,
      },
      {
        key: '1--50',
        from: 1,
        to: 50,
        doc_count: 2,
      },
      {
        key: '50--250',
        from: 50,
        to: 250,
        doc_count: 3,
      },
      {
        key: '250--500',
        from: 250,
        to: 500,
        doc_count: 4,
      },
      {
        key: '500--',
        from: 500,
        doc_count: 1,
      },
    ],
    loading: false,
    error: undefined,
    selectedBar: undefined,
    onSelectBarChange: jest.fn(),
    excludeSelfCitations: false,
  };

  it('should render a graph with correct data', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <CitationSummaryGraph {...testData} />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a graph with x and y axes', () => {
    const { container } = render(
      <Provider store={store}>
        <CitationSummaryGraph {...testData} />
      </Provider>
    );
    const xAxis = container.getElementsByClassName('x-axis');
    const yAxis = container.getElementsByClassName('y-axis');
    waitFor(() => expect(xAxis).toBeInTheDocument());
    waitFor(() => expect(yAxis).toBeInTheDocument());
  });

  it('should highlight the hovered bar', () => {
    const { container } = render(
      <Provider store={store}>
        <CitationSummaryGraph {...testData} />
      </Provider>
    );
    const citeableBars = container.getElementsByClassName(
      'rv-xy-plot__series rv-xy-plot__series--bar'
    );
    const firstCiteableBar = citeableBars[0];
    fireEvent.mouseEnter(firstCiteableBar);
    waitFor(() =>
      expect(firstCiteableBar).toHaveStyle(`fill: ${HOVERED_BLUE}`)
    );
  });

  it('should select a bar when it is clicked and call the onSelectBarChange function', () => {
    const onSelectBarChange = jest.fn();
    const testDataWithSelection = {
      ...testData,
      onSelectBarChange,
    };
    const { container } = render(
      <Provider store={store}>
        <CitationSummaryGraph {...testDataWithSelection} />
      </Provider>
    );
    const citeableBars = container.getElementsByClassName(
      'rv-xy-plot__series rv-xy-plot__series--bar'
    );
    const firstCiteableBar = citeableBars[0];
    fireEvent.click(firstCiteableBar);
    waitFor(() =>
      expect(onSelectBarChange).toHaveBeenCalledWith(
        { xValue: '0--0', type: CITEABLE_BAR_TYPE },
        testData.excludeSelfCitations
      )
    );
  });

  it('should unselect a selected bar when it is clicked and call the onSelectBarChange function', () => {
    const onSelectBarChange = jest.fn();
    const testDataWithSelection = {
      ...testData,
      selectedBar: { xValue: 1, type: 'citeable' } as Bar,
      onSelectBarChange,
    };
    const { container } = render(
      <Provider store={store}>
        <CitationSummaryGraph {...testDataWithSelection} />
      </Provider>
    );
    const citeableBars = container.getElementsByClassName(
      'rv-xy-plot__series rv-xy-plot__series--bar'
    );
    const firstCiteableBar = citeableBars[0];
    fireEvent.click(firstCiteableBar);

    waitFor(() =>
      expect(onSelectBarChange).toHaveBeenCalledWith(
        { xValue: 1, type: CITEABLE_BAR_TYPE },
        testData.excludeSelfCitations
      )
    );
  });

  it('abbreviates the numbers when they are bigger than 9999', () => {
    const mockData = [
      {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 9999,
      },
      {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 12769,
      },
    ];

    render(
      <CitationSummaryGraph
        publishedData={mockData}
        error={undefined}
        onSelectBarChange={jest.fn()}
      />
    );

    const expectedLowerLabel = screen.getByText('9999');
    const expectedHigherLabel = screen.getByText('13K');
    expect(expectedLowerLabel).toBeInTheDocument();
    expect(expectedHigherLabel).toBeInTheDocument();
  });
});
