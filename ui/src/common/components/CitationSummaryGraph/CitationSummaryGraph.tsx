import React, { Component } from 'react';
import {
  XAxis,
  YAxis,
  VerticalBarSeries,
  LabelSeries,
  FlexibleWidthXYPlot,
  DiscreteColorLegend,
  ChartLabel,
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
} from 'react-vis';
import { Row, Col, Tooltip } from 'antd';

import './CitationSummaryGraph.scss';
import 'react-vis/dist/style.css';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import maxBy from 'lodash.maxby';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';
// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/nooraangelva/Codes/inspirehep/ui/src/... Remove this comment to see the full error message
import styleVariables from '../../../styleVariables';
import { shallowEqual, abbreviateNumber } from '../../utils';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import { browser } from '../../browser.ts';

const BAR_WIDTH = 0.75;
const GRAPH_MARGIN = { left: 42, right: 10, top: 30, bottom: 40 };
const GRAPH_HEIGHT = 250;
const LABEL_ANCHOR_AT_Y = browser.isSafari() ? 'text-top' : 'text-after-edge';

export const ORANGE = styleVariables['orange-6'];
export const HOVERED_ORANGE = styleVariables['orange-7'];
export const BLUE = styleVariables['primary-color'];
export const HOVERED_BLUE = styleVariables['blue-7'];
export const GRAY = styleVariables['gray-6'];

const LEGENDS = [
  { title: 'Citeable', color: BLUE },
  { title: 'Published', color: ORANGE },
];

const xValueToLabel = {
  '0--0': '0',
  '1--9': '1-9',
  '10--49': '10-49',
  '50--99': '50-99',
  '100--249': '100-249',
  '250--499': '250-499',
  '500--': '500+',
};

const typeToColors = {
  [CITEABLE_BAR_TYPE]: { color: BLUE, hoveredColor: HOVERED_BLUE },
  [PUBLISHED_BAR_TYPE]: { color: ORANGE, hoveredColor: HOVERED_ORANGE },
};

export const LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH = 0.025;

type OwnProps = {
    excludeSelfCitations?: boolean;
    publishedData?: $TSFixMe[];
    citeableData?: $TSFixMe[];
    loading?: boolean;
    // @ts-expect-error ts-migrate(2749) FIXME: 'ErrorPropType' refers to a value, but is being us... Remove this comment to see the full error message
    error?: ErrorPropType;
    onSelectBarChange: $TSFixMeFunction;
    selectedBar?: {
        type: string;
        xValue: string;
    };
};

type State = $TSFixMe;

type Props = OwnProps & typeof CitationSummaryGraph.defaultProps;

class CitationSummaryGraph extends Component<Props, State> {
  static defaultProps = {
      publishedData: [],
      citeableData: [],
      loading: false,
      error: null,
      selectedBar: null,
      excludeSelfCitations: false,
  };

  graphRef: $TSFixMe;

  constructor() {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    super();
    this.onBarMouseOut = this.onBarMouseOut.bind(this);
    this.onCiteableBarHover = this.onCiteableBarHover.bind(this);
    this.onPublishedBarHover = this.onPublishedBarHover.bind(this);
    this.onCiteableBarClick = this.onCiteableBarClick.bind(this);
    this.onPublishedBarClick = this.onPublishedBarClick.bind(this);
    this.updateGraphWidth = this.updateGraphWidth.bind(this);
    this.graphRef = React.createRef();
    this.state = {
      hoveredBar: null,
      graphWidth: 0,
    };
  }

  componentDidMount() {
    this.updateGraphWidth();
    window.addEventListener('resize', this.updateGraphWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateGraphWidth);
  }

  onCiteableBarClick(datapoint: $TSFixMe) {
    this.onBarClick({
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    });
  }

  onPublishedBarClick(datapoint: $TSFixMe) {
    this.onBarClick({
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    });
  }

  onBarClick(clickedBar: $TSFixMe) {
    const { onSelectBarChange, excludeSelfCitations } = this.props;
    if (this.isSelectedBar(clickedBar)) {
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
      onSelectBarChange(null);
    } else {
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
      onSelectBarChange(clickedBar, excludeSelfCitations);
    }
  }

  onCiteableBarHover(datapoint: $TSFixMe) {
    const bar = {
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    };
    this.onBarMouseHover(bar);
  }

  onPublishedBarHover(datapoint: $TSFixMe) {
    const bar = {
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    };
    this.onBarMouseHover(bar);
  }

  onBarMouseHover(hoveredBar: $TSFixMe) {
    this.setState({ hoveredBar });
  }

  onBarMouseOut() {
    this.setState({ hoveredBar: null });
  }

  getBarColor(bar: $TSFixMe) {
    const { selectedBar } = this.props;
    if (this.isHoveredBar(bar)) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return typeToColors[bar.type].hoveredColor;
    }
    if (!selectedBar || this.isSelectedBar(bar)) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return typeToColors[bar.type].color;
    }
    return GRAY;
  }

  static getCountLabel(docCount: $TSFixMe) {
    if (docCount === 0) return null;
    if (docCount < 10000) return docCount.toString();
    return abbreviateNumber(docCount).toString();
  }

  updateGraphWidth() {
    const { graphWidth } = this.state;
    const currentWidth = this.graphRef.current.getBoundingClientRect().width;
    if (currentWidth !== graphWidth) {
      this.setState({ graphWidth: currentWidth });
    }
  }

  toSeriesData(bucket: $TSFixMe, type: $TSFixMe) {
    const { graphWidth } = this.state;
    const docCount = bucket.doc_count;
    const xOffset =
      type === CITEABLE_BAR_TYPE
        ? -LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * graphWidth
        : LABEL_OFFSET_RATIO_TO_GRAPH_WIDTH * graphWidth;
    return {
      x: bucket.key,
      y: docCount,
      label: CitationSummaryGraph.getCountLabel(docCount),
      color: this.getBarColor({ xValue: bucket.key, type }),
      xOffset,
    };
  }

  isHoveredBar(bar: $TSFixMe) {
    const { hoveredBar } = this.state;
    return shallowEqual(bar, hoveredBar);
  }

  isSelectedBar(bar: $TSFixMe) {
    const { selectedBar } = this.props;
    return shallowEqual(bar, selectedBar);
  }

  render() {
    const { citeableData, publishedData, loading, error } = this.props;
    const publishedSeriesData = (publishedData as $TSFixMe).map((b: $TSFixMe) => this.toSeriesData(b, PUBLISHED_BAR_TYPE));
    const citeableSeriesData = (citeableData as $TSFixMe).map((b: $TSFixMe) => this.toSeriesData(b, CITEABLE_BAR_TYPE));

    const yDomainMax = Math.max(
      publishedSeriesData.length !== 0 && maxBy(publishedSeriesData, 'y').y,
      citeableSeriesData.length !== 0 && maxBy(citeableSeriesData, 'y').y
    );

    return (
      <div className="__CitationSummaryGraph__" ref={this.graphRef}>
        <LoadingOrChildren loading={loading}>
          <ErrorAlertOrChildren error={error}>
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
            <Row type="flex" align="middle">
              <Col span={24}>
                <Tooltip
                  title="Click a bar to select papers. Click the bar again to reset your selection."
                  placement="bottom"
                >
                  <FlexibleWidthXYPlot
                    height={GRAPH_HEIGHT}
                    margin={GRAPH_MARGIN}
                    xType="ordinal"
                    yDomain={[0, yDomainMax * 1.15]}
                  >
                    <XAxis
                      className="x-axis"
                      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                      tickFormat={(v: $TSFixMe) => xValueToLabel[v]}
                    />
                    <ChartLabel
                      text="Citations"
                      xPercent={0.91}
                      yPercent={0.82}
                    />
                    <YAxis tickFormat={abbreviateNumber} />
                    <ChartLabel text="Papers" yPercent={-0.08} />
                    <VerticalBarSeries
                      colorType="literal"
                      data={citeableSeriesData}
                      barWidth={BAR_WIDTH}
                      onValueMouseOver={this.onCiteableBarHover}
                      onValueClick={this.onCiteableBarClick}
                      onValueMouseOut={this.onBarMouseOut}
                      data-test-id="citeable-bar-series"
                      className="pointer"
                    />
                    <LabelSeries
                      data={citeableSeriesData}
                      labelAnchorY={LABEL_ANCHOR_AT_Y}
                      labelAnchorX="middle"
                    />
                    <VerticalBarSeries
                      colorType="literal"
                      data={publishedSeriesData}
                      barWidth={BAR_WIDTH}
                      onValueMouseOver={this.onPublishedBarHover}
                      onValueClick={this.onPublishedBarClick}
                      onValueMouseOut={this.onBarMouseOut}
                      data-test-id="published-bar-series"
                      className="pointer"
                    />
                    <LabelSeries
                      data={publishedSeriesData}
                      labelAnchorY={LABEL_ANCHOR_AT_Y}
                      labelAnchorX="middle"
                    />
                    <DiscreteColorLegend
                      className="legend"
                      items={LEGENDS}
                      orientation="horizontal"
                    />
                  </FlexibleWidthXYPlot>
                </Tooltip>
              </Col>
            </Row>
          </ErrorAlertOrChildren>
        </LoadingOrChildren>
      </div>
    );
  }
}

export default CitationSummaryGraph;
