import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { LineSeries, FlexibleWidthXYPlot, YAxis, XAxis, Hint } from 'react-vis';

import 'react-vis/dist/style.css';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import maxBy from 'lodash.maxby';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/karolinasiemieniuk-morawska/repos/CER... Remove this comment to see the full error message
import styleVariables from '../../../styleVariables';
import { ErrorPropType } from '../../propTypes';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import pluralizeUnlessSingle, {
  pickEvenlyDistributedElements,
  abbreviateNumber,
  addCommasToNumber,
} from '../../utils';
import EmptyOrChildren from '../EmptyOrChildren';

const BLUE = styleVariables['primary-color'];
const GRAPH_MARGIN = { left: 40, right: 20, top: 10, bottom: 40 };
const GRAPH_HEIGHT = 250;

const MIN_NUMBER_OF_DATAPOINTS = 3;
const MAX_NUMBER_OF_TICKS_AT_X = 5;
const MAX_NUMBER_OF_TICKS_AT_Y = 5;

class CitationsByYearGraph extends Component {
  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const { citationsByYear } = nextProps;
    return {
      ...prevState,
      seriesData: CitationsByYearGraph.citationsByYearToSeriesData(
        citationsByYear
      ),
    };
  }

  static citationsByYearToSeriesData(citationsByYear: any) {
    const years = Object.keys(citationsByYear);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    const minYear = Math.min(...years);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(7022) FIXME: 'firstX' implicitly has type 'any' because it does... Remove this comment to see the full error message
        const firstX = seriesData[0].x;
        seriesData.unshift({ x: firstX - 1, y: 0 });
      }
    }

    return seriesData;
  }

  constructor(props: any) {
    super(props);

    this.state = {
      hoveredDatapoint: null,
    };

    this.onGraphMouseOver = this.onGraphMouseOver.bind(this);
    this.onGraphMouseOut = this.onGraphMouseOut.bind(this);
  }

  onGraphMouseOver(hoveredDatapoint: any) {
    this.setState({ hoveredDatapoint });
  }

  onGraphMouseOut() {
    this.setState({ hoveredDatapoint: null });
  }

  renderHint() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'hoveredDatapoint' does not exist on type... Remove this comment to see the full error message
    const { hoveredDatapoint } = this.state;
    return hoveredDatapoint && (
      <Hint
        align={{ vertical: 'top', horizontal: 'auto' }}
        value={hoveredDatapoint}
        format={({
          x,
          y
        }: any) => [
          {
            title: pluralizeUnlessSingle('Citation', y),
            value: addCommasToNumber(y),
          },
          { title: 'Year', value: x },
        ]}
      />
    );
  }

  renderXAxis() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seriesData' does not exist on type 'Read... Remove this comment to see the full error message
    const { seriesData } = this.state;

    const valuesAtX = seriesData.map((point: any) => point.x);
    const tickValuesAtX =
      seriesData.length < MAX_NUMBER_OF_TICKS_AT_X
        ? valuesAtX
        : pickEvenlyDistributedElements(valuesAtX, MAX_NUMBER_OF_TICKS_AT_X);
    return (
      <XAxis
        tickValues={tickValuesAtX}
        tickFormat={(value: any) => value /* avoid comma per 3 digit */}
      />
    );
  }

  renderYAxis() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seriesData' does not exist on type 'Read... Remove this comment to see the full error message
    const { seriesData } = this.state;
    // set tickValues at Y explicitly to avoid ticks like `2011.5`
    // only if it has less than MAX_NUMBER_OF_TICKS_AT_Y data points.
    // @ts-expect-error ts-migrate(2802) FIXME: Type 'Set<unknown>' can only be iterated through w... Remove this comment to see the full error message
    const uniqueValues = [...new Set(seriesData.map((point: any) => point.y))];
    const tickValuesAtY =
      uniqueValues.length < MAX_NUMBER_OF_TICKS_AT_Y ? uniqueValues : null;
    return (
      <YAxis
        tickValues={tickValuesAtY}
        tickTotal={MAX_NUMBER_OF_TICKS_AT_Y}
        tickFormat={abbreviateNumber}
      />
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { loading, error, citationsByYear } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seriesData' does not exist on type 'Read... Remove this comment to see the full error message
    const { seriesData } = this.state;
    const yDomainMax =
      (seriesData.length !== 0 && maxBy(seriesData, 'y').y) || 0;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LoadingOrChildren loading={loading}>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <ErrorAlertOrChildren error={error}>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <EmptyOrChildren data={citationsByYear} title="0 Citations">
            <div data-test-id="citations-by-year-graph">
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
            </div>
          </EmptyOrChildren>
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CitationsByYearGraph.propTypes = {
  citationsByYear: PropTypes.objectOf(PropTypes.number).isRequired,
  loading: PropTypes.bool,
  error: ErrorPropType,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CitationsByYearGraph.defaultProps = {
  error: null,
  loading: false,
};

export default CitationsByYearGraph;
