import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { LineSeries, FlexibleWidthXYPlot, YAxis, XAxis } from 'react-vis';
import 'react-vis/dist/style.css';
import PropTypes from 'prop-types';
import styleVariables from '../../../styleVariables';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

const BLUE = styleVariables['primary-color'];
const GRAPH_MARGIN = { left: 30, right: 20, top: 10, bottom: 30 };
const MIN_NUMBER_OF_DATAPOINTS = 3;
const MAX_NUMBER_OF_TICKS_AT_X = 8;

class CitationsByYearGraph extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { citationsByYear } = nextProps;
    return {
      ...prevState,
      seriesData: CitationsByYearGraph.citationsByYearToSeriesData(
        citationsByYear
      ),
    };
  }

  static citationsByYearToSeriesData(citationsByYear) {
    const seriesData = Object.keys(citationsByYear).map(year => ({
      x: Number(year),
      y: citationsByYear[year],
    }));

    // Add dummy data points at the begining of the data
    // if it is not empty and has less than MIN_NUMBER_OF_DATAPOINTS
    const missingSeries = MIN_NUMBER_OF_DATAPOINTS - seriesData.length;
    if (missingSeries > 0 && seriesData.length > 0) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < missingSeries; i++) {
        const firstX = seriesData[0].x;
        seriesData.unshift({ x: firstX - 1, y: 0 });
      }
    }

    return seriesData;
  }

  constructor(props) {
    super(props);

    this.state = {
      hoveredYear: null,
      hoveredCitations: null,
    };

    this.onGraphMouseOver = this.onGraphMouseOver.bind(this);
  }

  onGraphMouseOver(datapoint) {
    const { x, y } = datapoint;
    this.setState({
      hoveredYear: x,
      hoveredCitations: y,
    });
  }

  renderHoveredInfo() {
    const { hoveredCitations, hoveredYear } = this.state;

    return (
      <span>
        <strong>{hoveredCitations}</strong> citations in{' '}
        <strong>{hoveredYear}</strong>
      </span>
    );
  }

  renderXAxis() {
    const { seriesData } = this.state;
    // set tickValues at X explicitly to avoid ticks like `2011.5`
    // only if it has less than MAX_NUMBER_OF_TICKS_AT_X data points.
    const tickValuesAtX =
      seriesData.length < MAX_NUMBER_OF_TICKS_AT_X
        ? seriesData.map(point => point.x)
        : null;
    return (
      <XAxis
        tickValues={tickValuesAtX}
        tickTotal={MAX_NUMBER_OF_TICKS_AT_X}
        tickFormat={value => value /* avoid comma per 3 digit */}
      />
    );
  }

  render() {
    const { loading, error } = this.props;
    const { seriesData } = this.state;
    return (
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <Tooltip title={this.renderHoveredInfo()} placement="bottom">
            <FlexibleWidthXYPlot height={150} margin={GRAPH_MARGIN}>
              {this.renderXAxis()}
              <YAxis />
              <LineSeries
                onNearestX={this.onGraphMouseOver}
                data={seriesData}
                color={BLUE}
              />
            </FlexibleWidthXYPlot>
          </Tooltip>
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    );
  }
}

CitationsByYearGraph.propTypes = {
  citationsByYear: PropTypes.objectOf(PropTypes.number).isRequired, // eslint-disable-line react/no-unused-prop-types
  loading: PropTypes.bool,
  error: ErrorPropType,
};

CitationsByYearGraph.defaultProps = {
  error: null,
  loading: false,
};

export default CitationsByYearGraph;
