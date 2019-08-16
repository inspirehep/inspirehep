import React, { Component } from 'react';
import { LineSeries, FlexibleWidthXYPlot, YAxis, XAxis, Hint } from 'react-vis';
import NumberAbbreviator from 'number-abbreviate';

import 'react-vis/dist/style.css';
import maxBy from 'lodash.maxby';
import PropTypes from 'prop-types';
import styleVariables from '../../../styleVariables';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import pluralizeUnlessSingle, {
  pickEvenlyDistributedElements,
} from '../../utils';

const BLUE = styleVariables['primary-color'];
const GRAPH_MARGIN = { left: 40, right: 20, top: 10, bottom: 40 };
const GRAPH_HEIGHT = 250;

const MIN_NUMBER_OF_DATAPOINTS = 3;
const MAX_NUMBER_OF_TICKS_AT_X = 5;
const MAX_NUMBER_OF_TICKS_AT_Y = 5;

const numberAbbreviator = new NumberAbbreviator(['K', 'M', 'B', 'T']);

function getNumberOfFractionsForValue(value) {
  return value < 10000 ? 1 : 0;
}

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
    const years = Object.keys(citationsByYear);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const seriesData = [];
    // eslint-disable-next-line no-plusplus
    for (let year = minYear; year <= maxYear; year++) {
      const citations = citationsByYear[year] || 0;
      seriesData.push({ x: year, y: citations });
    }

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
      hoveredDatapoint: null,
    };

    this.onGraphMouseOver = this.onGraphMouseOver.bind(this);
    this.onGraphMouseOut = this.onGraphMouseOut.bind(this);
  }

  onGraphMouseOver(hoveredDatapoint) {
    this.setState({ hoveredDatapoint });
  }

  onGraphMouseOut() {
    this.setState({ hoveredDatapoint: null });
  }

  renderHint() {
    const { hoveredDatapoint } = this.state;
    return (
      hoveredDatapoint && (
        <Hint
          align={{ vertical: 'top', horizontal: 'auto' }}
          value={hoveredDatapoint}
          format={({ x, y }) => [
            { title: pluralizeUnlessSingle('Citation', y), value: y },
            { title: 'Year', value: x },
          ]}
        />
      )
    );
  }

  renderXAxis() {
    const { seriesData } = this.state;

    const valuesAtX = seriesData.map(point => point.x);
    const tickValuesAtX =
      seriesData.length < MAX_NUMBER_OF_TICKS_AT_X
        ? valuesAtX
        : pickEvenlyDistributedElements(valuesAtX, MAX_NUMBER_OF_TICKS_AT_X);
    return (
      <XAxis
        tickValues={tickValuesAtX}
        tickFormat={value => value /* avoid comma per 3 digit */}
      />
    );
  }

  renderYAxis() {
    const { seriesData } = this.state;
    // set tickValues at Y explicitly to avoid ticks like `2011.5`
    // only if it has less than MAX_NUMBER_OF_TICKS_AT_Y data points.
    const uniqueValues = [...new Set(seriesData.map(point => point.y))];
    const tickValuesAtY =
      uniqueValues.length < MAX_NUMBER_OF_TICKS_AT_Y ? uniqueValues : null;
    return (
      <YAxis
        tickValues={tickValuesAtY}
        tickTotal={MAX_NUMBER_OF_TICKS_AT_Y}
        tickFormat={value =>
          numberAbbreviator.abbreviate(
            value,
            getNumberOfFractionsForValue(value)
          )
        }
      />
    );
  }

  render() {
    const { loading, error } = this.props;
    const { seriesData } = this.state;
    const yDomainMax =
      (seriesData.length !== 0 && maxBy(seriesData, 'y').y) || 0;
    return (
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <FlexibleWidthXYPlot
            onMouseLeave={this.onGraphMouseOut}
            className="__CitationsByYearGraph__"
            height={GRAPH_HEIGHT}
            margin={GRAPH_MARGIN}
            yDomain={[0, yDomainMax]}
          >
            {this.renderXAxis()}
            {this.renderYAxis()}
            <LineSeries
              sizeType="literal"
              onNearestX={this.onGraphMouseOver}
              data={seriesData}
              color={BLUE}
            />
            {this.renderHint()}
          </FlexibleWidthXYPlot>
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
