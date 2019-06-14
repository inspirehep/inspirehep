import React from 'react';
import { shallow, mount } from 'enzyme';
import CitationSummaryGraph, {
  ORANGE,
  HOVERED_ORANGE,
  BLUE,
  GRAY,
  LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH,
} from '../CitationSummaryGraph/CitationSummaryGraph';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';

const mockPublishedData = [
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
    key: '--500',
    from: 500,
    doc_count: 0,
  },
];
const mockCiteableData = [
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
    doc_count: 0,
  },
];
describe('CitationSummaryGraph', () => {
  const originalUpdateGraphWidth =
    CitationSummaryGraph.prototype.updateGraphWidth;

  beforeEach(() => {
    CitationSummaryGraph.prototype.updateGraphWidth = jest.fn();
  });

  afterEach(() => {
    CitationSummaryGraph.prototype.updateGraphWidth = originalUpdateGraphWidth;
  });

  it('renders graph without SelectedBar', () => {
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders graph with selectedBar', () => {
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={jest.fn()}
        selectedBar={{ type: CITEABLE_BAR_TYPE, xValue: '500--' }}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with hovered bar', () => {
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={jest.fn()}
      />
    );
    wrapper.setState({
      hoveredBar: { type: CITEABLE_BAR_TYPE, xValue: '500--' },
    });
    expect(wrapper).toMatchSnapshot();
  });

  describe('toSeriesData', () => {
    it('returns series data with correct color', () => {
      const wrapper = shallow(
        <CitationSummaryGraph
          publishedData={mockPublishedData}
          citeableData={mockCiteableData}
          loadingCitationSummary={false}
          error={null}
          onSelectBarChange={jest.fn()}
        />
      );
      const bucket = {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 10,
      };
      const data = wrapper.instance().toSeriesData(bucket, PUBLISHED_BAR_TYPE);
      const expectedData = {
        x: '0--0',
        y: 10,
        label: '10',
        color: ORANGE,
        xOffset: 0,
      };
      expect(data).toEqual(expectedData);
    });

    it('returns series data with correct color for hovered bar', () => {
      const wrapper = shallow(
        <CitationSummaryGraph
          publishedData={mockPublishedData}
          citeableData={mockCiteableData}
          loadingCitationSummary={false}
          error={null}
          onSelectBarChange={jest.fn()}
        />
      );
      wrapper.setState({
        hoveredBar: { type: PUBLISHED_BAR_TYPE, xValue: '0--0' },
      });
      const bucket = {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 10,
      };
      const data = wrapper.instance().toSeriesData(bucket, PUBLISHED_BAR_TYPE);
      const expectedData = {
        x: '0--0',
        y: 10,
        label: '10',
        color: HOVERED_ORANGE,
        xOffset: 0,
      };
      expect(data).toEqual(expectedData);
    });

    it('returns series data with correct color when selected bar', () => {
      const wrapper = shallow(
        <CitationSummaryGraph
          publishedData={mockPublishedData}
          citeableData={mockCiteableData}
          loadingCitationSummary={false}
          error={null}
          onSelectBarChange={jest.fn()}
          selectedBar={{ type: CITEABLE_BAR_TYPE, xValue: '0--0' }}
        />
      );
      const bucketSelectedBar = {
        key: '0--0',
        from: 0,
        to: 1,
        doc_count: 10,
      };
      const dataSelectedBar = wrapper
        .instance()
        .toSeriesData(bucketSelectedBar, CITEABLE_BAR_TYPE);
      const expectedDataSelectedBar = {
        x: '0--0',
        y: 10,
        label: '10',
        color: BLUE,
        xOffset: -0,
      };
      expect(dataSelectedBar).toEqual(expectedDataSelectedBar);

      const bucketUnSelectedBar = {
        key: '10--49',
        from: 0,
        to: 1,
        doc_count: 10,
      };
      const dataUnSelectedBar = wrapper
        .instance()
        .toSeriesData(bucketUnSelectedBar, CITEABLE_BAR_TYPE);
      const expectedDataUnSelectedBar = {
        x: '10--49',
        y: 10,
        label: '10',
        color: GRAY,
        xOffset: -0,
      };
      expect(dataUnSelectedBar).toEqual(expectedDataUnSelectedBar);
    });
  });

  it('calls onSelectBarChange when citeable bar clicked', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    const onCiteableBarClick = wrapper
      .find('[data-test-id="citeable-bar-series"]')
      .prop('onValueClick');
    onCiteableBarClick({ x: '0--0' });
    expect(onSelectBarChange).toHaveBeenCalledWith({
      type: CITEABLE_BAR_TYPE,
      xValue: '0--0',
    });
  });

  it('calls onSelectBarChange with null when selected citeable bar clicked', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
        selectedBar={{ type: CITEABLE_BAR_TYPE, xValue: '0--0' }}
      />
    );
    const onCiteableBarClick = wrapper
      .find('[data-test-id="citeable-bar-series"]')
      .prop('onValueClick');
    onCiteableBarClick({ x: '0--0' });
    expect(onSelectBarChange).toHaveBeenCalledWith(null);
  });

  it('calls onSelectBarChange when published bar clicked', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    const onPublishedBarClick = wrapper
      .find('[data-test-id="published-bar-series"]')
      .prop('onValueClick');
    onPublishedBarClick({ x: '0--0' });
    expect(onSelectBarChange).toHaveBeenCalledWith({
      type: PUBLISHED_BAR_TYPE,
      xValue: '0--0',
    });
  });

  it('adds hoveredBar to state when citeable bar is hovered', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    const onCiteableBarHover = wrapper
      .find('[data-test-id="citeable-bar-series"]')
      .prop('onValueMouseOver');
    onCiteableBarHover({ x: '0--0' });
    expect(wrapper.state('hoveredBar')).toEqual({
      type: CITEABLE_BAR_TYPE,
      xValue: '0--0',
    });
  });

  it('adds hoveredBar to state when published bar is hovered', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    const onPublishedBarHover = wrapper
      .find('[data-test-id="published-bar-series"]')
      .prop('onValueMouseOver');
    onPublishedBarHover({ x: '0--0' });
    expect(wrapper.state('hoveredBar')).toEqual({
      type: PUBLISHED_BAR_TYPE,
      xValue: '0--0',
    });
  });

  it('sets hoveredBar in state to null when published bar is not hovered anymore', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    wrapper.setState({
      hoveredBar: { type: PUBLISHED_BAR_TYPE, xValue: '0--0' },
    });
    const onPublishedBarUnHover = wrapper
      .find('[data-test-id="published-bar-series"]')
      .prop('onValueMouseOut');
    onPublishedBarUnHover();
    expect(wrapper.state('hoveredBar')).toEqual(null);
  });

  it('sets hoveredBar in state to null when citeable bar is not hovered anymore', () => {
    const onSelectBarChange = jest.fn();
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={onSelectBarChange}
      />
    );
    wrapper.setState({
      hoveredBar: { type: CITEABLE_BAR_TYPE, xValue: '0--0' },
    });
    const onCiteableBarUnHover = wrapper
      .find('[data-test-id="citeable-bar-series"]')
      .prop('onValueMouseOut');
    onCiteableBarUnHover();
    expect(wrapper.state('hoveredBar')).toEqual(null);
  });

  it('sets graphWidth using ref width and recalculates graphWidth after resize event', () => {
    CitationSummaryGraph.prototype.updateGraphWidth = originalUpdateGraphWidth;

    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValueOnce({
        width: 120,
      })
      .mockReturnValueOnce({
        width: 150,
      });

    const wrapper = mount(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={jest.fn()}
      />
    );
    expect(wrapper.state().graphWidth).toBe(120);
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    expect(wrapper.state().graphWidth).toBe(150);
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('sets xOffset from state', () => {
    const wrapper = shallow(
      <CitationSummaryGraph
        publishedData={mockPublishedData}
        citeableData={mockCiteableData}
        loadingCitationSummary={false}
        error={null}
        onSelectBarChange={jest.fn()}
      />
    );
    wrapper.setState({ graphWidth: 1000 });
    const bucket = {
      key: '0--0',
      from: 0,
      to: 1,
      doc_count: 10,
    };
    const dataPublished = wrapper
      .instance()
      .toSeriesData(bucket, PUBLISHED_BAR_TYPE);
    const expectedOffsetPublished = LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * 1000;
    expect(dataPublished.xOffset).toEqual(expectedOffsetPublished);

    const dataCiteable = wrapper
      .instance()
      .toSeriesData(bucket, CITEABLE_BAR_TYPE);
    const expectedOffsetCiteable = -LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * 1000;
    expect(dataCiteable.xOffset).toEqual(expectedOffsetCiteable);
  });
});
