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
import '../../../../node_modules/react-vis/dist/style.css';
import maxby from 'lodash.maxby';
import styleVariables from '../../../styleVariables';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

const BAR_WIDTH = 0.5;

const ORANGE = styleVariables['orange-6'];
const BLUE = styleVariables['primary-color'];

const LEGENDS = [
  { title: 'Citeable', color: BLUE },
  { title: 'Published', color: ORANGE },
];

const xValueToLabel = {
  '0.0-1.0': '0',
  '1.0-10.0': '1-9',
  '10.0-50.0': '10-49',
  '50.0-100.0': '50-99',
  '100.0-250.0': '100-249',
  '250.0-500.0': '250-499',
  '500.0-*': '500+',
};

class CitationSummaryGraph extends Component {
  static toSeriesData(bucket) {
    const docCount = bucket.doc_count;
    const countLabel = docCount !== 0 ? docCount.toString() : null;
    return { x: bucket.key, y: docCount, label: countLabel };
  }

  render() {
    const {
      citeableData,
      publishedData,
      loadingCitationSummary,
      error,
    } = this.props;
    const publishedSeriesData = publishedData.map(
      CitationSummaryGraph.toSeriesData
    );
    const citeableSeriesData = citeableData.map(
      CitationSummaryGraph.toSeriesData
    );

    const yDomainMax = Math.max(
      publishedSeriesData.length !== 0 && maxby(publishedSeriesData, 'y').y,
      citeableSeriesData.length !== 0 && maxby(citeableSeriesData, 'y').y
    );

    return (
      <div className="__CitationSummaryGraph__">
        <Fragment>
          <LoadingOrChildren loading={loadingCitationSummary}>
            <ErrorAlertOrChildren error={error}>
              <Row type="flex" align="middle">
                <Col span={1}>
                  <div className="axis-label y-axis">Papers</div>
                </Col>
                <Col span={23}>
                  <FlexibleWidthXYPlot
                    height={300}
                    xType="ordinal"
                    animation
                    yDomain={[0, yDomainMax * 1.3]}
                  >
                    <HorizontalGridLines />
                    <XAxis
                      className="x-axis"
                      tickFormat={v => xValueToLabel[v]}
                    />
                    <YAxis />
                    <VerticalBarSeries
                      data={citeableSeriesData}
                      color={BLUE}
                      barWidth={BAR_WIDTH}
                    />
                    <LabelSeries
                      data={citeableSeriesData}
                      labelAnchorX="end"
                      labelAnchorY="text-after-edge"
                    />
                    <VerticalBarSeries
                      data={publishedSeriesData}
                      color={ORANGE}
                      barWidth={BAR_WIDTH}
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
  loadingCitationSummary: PropTypes.bool,
  error: ErrorPropType,
};

CitationSummaryGraph.defaultProps = {
  publishedData: [],
  citeableData: [],
  loadingCitationSummary: false,
  error: null,
};

export default CitationSummaryGraph;
