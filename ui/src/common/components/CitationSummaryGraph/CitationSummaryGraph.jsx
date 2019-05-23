import React, { Component, Fragment } from 'react';
import {
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalBarSeries,
  LabelSeries,
  FlexibleWidthXYPlot,
  DiscreteColorLegend,
} from 'react-vis';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import './CitationSummaryGraph.scss';
import 'react-vis/dist/style.css';
import maxBy from 'lodash.maxby';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { CITEABLE_BAR_TYPE, PUBLISHED_BAR_TYPE } from '../../constants';
import styleVariables from '../../../styleVariables';
import { shallowEqual } from '../../utils';

const BAR_WIDTH = 0.5;

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

class CitationSummaryGraph extends Component {
  constructor() {
    super();
    this.onBarMouseOut = this.onBarMouseOut.bind(this);
    this.onCiteableBarHover = this.onCiteableBarHover.bind(this);
    this.onPublishedBarHover = this.onPublishedBarHover.bind(this);
    this.onCiteableBarClick = this.onCiteableBarClick.bind(this);
    this.onPublishedBarClick = this.onPublishedBarClick.bind(this);
    this.state = {
      hoveredBar: null,
    };
  }

  onCiteableBarClick(datapoint) {
    this.onBarClick({
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    });
  }

  onPublishedBarClick(datapoint) {
    this.onBarClick({
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    });
  }

  onBarClick(clickedBar) {
    const { onSelectBarChange } = this.props;
    if (this.isSelectedBar(clickedBar)) {
      onSelectBarChange(null);
    } else {
      onSelectBarChange(clickedBar);
    }
  }

  onCiteableBarHover(datapoint) {
    this.onBarMouseHover({
      xValue: datapoint.x,
      type: CITEABLE_BAR_TYPE,
    });
  }

  onPublishedBarHover(datapoint) {
    this.onBarMouseHover({
      xValue: datapoint.x,
      type: PUBLISHED_BAR_TYPE,
    });
  }

  onBarMouseHover(hoveredBar) {
    this.setState({ hoveredBar });
  }

  onBarMouseOut() {
    this.setState({ hoveredBar: null });
  }

  getBarColor(bar) {
    const { selectedBar } = this.props;
    if (this.isHoveredBar(bar)) {
      return typeToColors[bar.type].hoveredColor;
    }
    if (!selectedBar || this.isSelectedBar(bar)) {
      return typeToColors[bar.type].color;
    }
    return GRAY;
  }

  toSeriesData(bucket, type) {
    const docCount = bucket.doc_count;
    const countLabel = docCount !== 0 ? docCount.toString() : null;
    return {
      x: bucket.key,
      y: docCount,
      label: countLabel,
      color: this.getBarColor({ xValue: bucket.key, type }),
    };
  }

  isHoveredBar(bar) {
    const { hoveredBar } = this.state;
    return shallowEqual(bar, hoveredBar);
  }

  isSelectedBar(bar) {
    const { selectedBar } = this.props;
    return shallowEqual(bar, selectedBar);
  }

  render() {
    const { citeableData, publishedData, loading, error } = this.props;
    const publishedSeriesData = publishedData.map(b =>
      this.toSeriesData(b, PUBLISHED_BAR_TYPE)
    );
    const citeableSeriesData = citeableData.map(b =>
      this.toSeriesData(b, CITEABLE_BAR_TYPE)
    );

    const yDomainMax = Math.max(
      publishedSeriesData.length !== 0 && maxBy(publishedSeriesData, 'y').y,
      citeableSeriesData.length !== 0 && maxBy(citeableSeriesData, 'y').y
    );
    return (
      <div className="__CitationSummaryGraph__">
        <Fragment>
          <LoadingOrChildren loading={loading}>
            <ErrorAlertOrChildren error={error}>
              <Row type="flex" align="middle">
                <Col span={1}>
                  <div className="axis-label y-axis">Papers</div>
                </Col>
                <Col span={23}>
                  <FlexibleWidthXYPlot
                    height={300}
                    xType="ordinal"
                    yDomain={[0, yDomainMax * 1.3]}
                  >
                    <HorizontalGridLines />
                    <XAxis
                      className="x-axis"
                      tickFormat={v => xValueToLabel[v]}
                    />
                    <YAxis />
                    <VerticalBarSeries
                      colorType="literal"
                      data={citeableSeriesData}
                      barWidth={BAR_WIDTH}
                      onValueMouseOver={this.onCiteableBarHover}
                      onValueClick={this.onCiteableBarClick}
                      onValueMouseOut={this.onBarMouseOut}
                      data-test-id="citeable-bar-series"
                    />
                    <LabelSeries
                      data={citeableSeriesData}
                      labelAnchorX="end"
                      labelAnchorY="text-after-edge"
                    />
                    <VerticalBarSeries
                      colorType="literal"
                      data={publishedSeriesData}
                      barWidth={BAR_WIDTH}
                      onValueMouseOver={this.onPublishedBarHover}
                      onValueClick={this.onPublishedBarClick}
                      onValueMouseOut={this.onBarMouseOut}
                      data-test-id="published-bar-series"
                    />
                    <LabelSeries
                      data={publishedSeriesData}
                      labelAnchorX="start"
                      labelAnchorY="text-after-edge"
                    />
                    <DiscreteColorLegend
                      className="legend"
                      items={LEGENDS}
                      orientation="horizontal"
                    />
                  </FlexibleWidthXYPlot>
                </Col>
              </Row>
              <Row type="flex" justify="center">
                <div className="axis-label">Citations</div>
              </Row>
            </ErrorAlertOrChildren>
          </LoadingOrChildren>
        </Fragment>
      </div>
    );
  }
}

CitationSummaryGraph.propTypes = {
  publishedData: PropTypes.arrayOf(PropTypes.any),
  citeableData: PropTypes.arrayOf(PropTypes.any),
  loading: PropTypes.bool,
  error: ErrorPropType,
  onSelectBarChange: PropTypes.func.isRequired,
  selectedBar: PropTypes.shape({
    type: PropTypes.string.isRequired,
    xValue: PropTypes.string.isRequired,
  }),
};

CitationSummaryGraph.defaultProps = {
  publishedData: [],
  citeableData: [],
  loading: false,
  error: null,
  selectedBar: null,
};

export default CitationSummaryGraph;
