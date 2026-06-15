import { screen, waitFor, render, fireEvent } from '@testing-library/react';

import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import CitationSummaryGraph, {
  BarType,
  HOVERED_BLUE,
} from '../CitationSummaryGraph';
import { CITEABLE_BAR_TYPE } from '../../../constants';

describe('CitationSummaryGraph', () => {
  const store = getStore();

  const testData = {
    publishedData: [
      {
        key: '0--0',
        from: 0,
        to: 0,
        doc_count: 1,
      },
      {
        key: '1--9',
        from: 1,
        to: 9,
        doc_count: 2,
      },
      {
        key: '10--49',
        from: 10,
        to: 49,
        doc_count: 3,
      },
      {
        key: '50--99',
        from: 50,
        to: 99,
        doc_count: 4,
      },
      {
        key: '100--249',
        from: 100,
        to: 249,
        doc_count: 4,
      },
      {
        key: '250--499',
        from: 250,
        to: 499,
        doc_count: 4,
      },
      {
        key: '500--',
        from: 500,
        doc_count: 1,
      },
    ],
    citeableData: [
      {
        key: '0--0',
        from: 0,
        to: 0,
        doc_count: 1,
      },
      {
        key: '1--9',
        from: 1,
        to: 9,
        doc_count: 2,
      },
      {
        key: '10--49',
        from: 10,
        to: 49,
        doc_count: 3,
      },
      {
        key: '50--99',
        from: 50,
        to: 99,
        doc_count: 4,
      },
      {
        key: '100--249',
        from: 100,
        to: 249,
        doc_count: 4,
      },
      {
        key: '250--499',
        from: 250,
        to: 499,
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
    const { asFragment } = renderWithProviders(
      <CitationSummaryGraph {...testData} />,
      { store }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a graph with x and y axes', () => {
    const { container } = renderWithProviders(
      <CitationSummaryGraph {...testData} />,
      { store }
    );
    const xAxis = container.getElementsByClassName('x-axis')[0];
    const yAxis = container.getElementsByClassName('y-axis')[0];
    expect(xAxis).toBeInTheDocument();
    expect(yAxis).toBeInTheDocument();
  });

  it('should highlight the hovered bar', async () => {
    const { container } = renderWithProviders(
      <CitationSummaryGraph {...testData} />,
      { store }
    );
    const citeableBars = container.getElementsByClassName(
      'recharts-layer recharts-bar-rectangle'
    );
    const firstCiteableBar = citeableBars[0];

    fireEvent.mouseEnter(firstCiteableBar);

    await waitFor(() => {
      const bars = container.getElementsByClassName(
        'recharts-layer recharts-bar-rectangle'
      );
      expect(bars[0].children[0].children[0]).toHaveAttribute(
        'fill',
        HOVERED_BLUE
      );
    });
  });

  it('should select a bar when it is clicked and call the onSelectBarChange function', () => {
    const onSelectBarChange = jest.fn();
    const testDataWithSelection = {
      ...testData,
      onSelectBarChange,
    };
    const { container } = renderWithProviders(
      <CitationSummaryGraph {...testDataWithSelection} />,
      { store }
    );
    const citeableBars = container.getElementsByClassName(
      'recharts-layer recharts-bar-rectangle'
    );
    const firstCiteableBar = citeableBars[0];
    fireEvent.click(firstCiteableBar);
    expect(onSelectBarChange).toHaveBeenCalledWith(
      { xValue: '0--0', type: CITEABLE_BAR_TYPE },
      testData.excludeSelfCitations
    );
  });

  it('should unselect a selected bar when it is clicked and call the onSelectBarChange function', () => {
    const onSelectBarChange = jest.fn();
    const testDataWithSelection = {
      ...testData,
      selectedBar: { xValue: '0--0', type: 'citeable' } as BarType,
      onSelectBarChange,
    };
    const { container } = renderWithProviders(
      <CitationSummaryGraph {...testDataWithSelection} />,
      { store }
    );
    const citeableBars = container.getElementsByClassName(
      'recharts-layer recharts-bar-rectangle'
    );
    const firstCiteableBar = citeableBars[0];
    fireEvent.click(firstCiteableBar);
    expect(onSelectBarChange).toHaveBeenCalledWith(null);
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
        key: '1--9',
        from: 1,
        to: 9,
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

    const expectedLowerLabel = screen.getByText('9999', { selector: 'tspan' });
    const expectedHigherLabel = screen.getByText('13K', { selector: 'tspan' });
    expect(expectedLowerLabel).toBeInTheDocument();
    expect(expectedHigherLabel).toBeInTheDocument();
  });
});
