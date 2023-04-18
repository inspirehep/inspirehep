import React, { useState, useEffect } from 'react';
import {
  LineMarkSeries,
  MarkSeries,
  LineSeries,
  FlexibleWidthXYPlot,
  YAxis,
  XAxis,
  Hint,
  MarkSeriesPoint,
  LineMarkSeriesPoint,
  RVNearestXEventHandler,
} from 'react-vis';
import 'react-vis/dist/style.css';
import maxBy from 'lodash.maxby';
import { Map } from 'immutable';

import styleVariables from '../../../styleVariables';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import {
  pluralizeUnlessSingle,
  pickEvenlyDistributedElements,
  abbreviateNumber,
  addCommasToNumber,
} from '../../utils';
import EmptyOrChildren from '../EmptyOrChildren';

const BLUE = styleVariables['@primary-color'];
const LIGHT_BLUE = styleVariables['@primary-with-opacity'];
const GRAPH_MARGIN = { left: 40, right: 20, top: 10, bottom: 40 };
const GRAPH_HEIGHT = 250;

const MIN_NUMBER_OF_DATAPOINTS = 3;
const MAX_NUMBER_OF_TICKS_AT_X = 5;
const MAX_NUMBER_OF_TICKS_AT_Y = 5;

interface GraphData {
  x: number;
  y: number;
}

function CitationsByYearGraph({
  loading,
  error,
  citationsByYear,
}: {
  loading: boolean;
  error: Map<string, string>;
  citationsByYear: Record<any, any>;
}) {
  const [hoveredDatapoint, setHoveredDatapoint] = useState<GraphData | null>(
    null
  );
  const [seriesData, setSeriesData] = useState<GraphData[]>([]);

  function citationsByYearToSeriesData(citationsByYear: Record<any, any>) {
    const years = Object.keys(citationsByYear).map(Number);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const seriesData = [];

    for (let year = minYear; year <= maxYear; year++) {
      const citations = citationsByYear[year] || 0;
      seriesData.push({ x: year, y: citations });
    }

    const missingSeries = MIN_NUMBER_OF_DATAPOINTS - seriesData.length;
    if (missingSeries > 0 && seriesData.length > 0) {
      for (let i = 0; i < missingSeries; i++) {
        const firstX: number = seriesData[0].x;
        seriesData.unshift({ x: firstX - 1, y: 0 });
      }
    }

    return seriesData;
  }

  useEffect(() => {
    setSeriesData(citationsByYearToSeriesData(citationsByYear));
  }, [citationsByYear]);

  function onGraphMouseOver(datapoint: GraphData) {
    setHoveredDatapoint(datapoint);
  }

  function onGraphMouseOut() {
    setHoveredDatapoint(null);
  }

  function renderHint() {
    return (
      hoveredDatapoint && (
        <Hint
          align={{ vertical: 'top', horizontal: 'auto' }}
          key={hoveredDatapoint.x}
          value={hoveredDatapoint}
          format={({ x, y }) => [
            {
              title: pluralizeUnlessSingle('Citation', y),
              value: addCommasToNumber(y),
            },
            { title: 'Year', value: x },
          ]}
        />
      )
    );
  }

  function renderXAxis() {
    const valuesAtX = seriesData.map((point) => point.x);
    const tickValuesAtX =
      seriesData.length < MAX_NUMBER_OF_TICKS_AT_X
        ? valuesAtX
        : pickEvenlyDistributedElements(valuesAtX, MAX_NUMBER_OF_TICKS_AT_X);
    return (
      <XAxis
        tickValues={tickValuesAtX}
        tickFormat={(value) => value /* avoid comma per 3 digit */}
      />
    );
  }

  function renderYAxis() {
    const uniqueValues = [...new Set(seriesData.map((point) => point.y))];
    const tickValuesAtY =
      uniqueValues.length < MAX_NUMBER_OF_TICKS_AT_Y ? uniqueValues : undefined;
    return (
      <YAxis
        tickValues={tickValuesAtY}
        tickTotal={MAX_NUMBER_OF_TICKS_AT_Y}
        tickFormat={abbreviateNumber}
      />
    );
  }

  function renderCitationsGraph() {
    const currentYear = new Date().getFullYear();
    const yearOfLastCitation = seriesData?.slice(-1)[0]?.x;
    const currentYearSeries = seriesData.slice(
      seriesData.length - 2,
      seriesData.length
    );
    const pastYearsSeries = seriesData.slice(0, seriesData.length - 1);

    if (yearOfLastCitation === currentYear) {
      return [
        <LineSeries data={pastYearsSeries} color={BLUE} key="past-years" />,
        <LineSeries
          data={currentYearSeries}
          color={LIGHT_BLUE}
          // @ts-expect-error
          strokeDasharray="7 3"
          key="current-year"
        />,
        <MarkSeries
          data={[...pastYearsSeries, ...currentYearSeries]}
          color={BLUE}
          onNearestX={
            onGraphMouseOver as RVNearestXEventHandler<MarkSeriesPoint>
          }
          stroke={BLUE}
          // @ts-expect-error
          size={3}
          fill={BLUE}
          key="marks"
        />,
      ];
    }
    return (
      <LineMarkSeries
        onNearestX={
          onGraphMouseOver as RVNearestXEventHandler<LineMarkSeriesPoint>
        }
        data={seriesData}
        markStyle={{ stroke: BLUE }}
        color={BLUE}
        size={3}
      />
    );
  }

  const yDomainMax =
    (seriesData.length !== 0 && maxBy(seriesData, 'y')?.y) || 0;

  return (
    <LoadingOrChildren loading={loading}>
      <ErrorAlertOrChildren error={error}>
        <EmptyOrChildren data={citationsByYear} title="0 Citations">
          <div data-test-id="citations-by-year-graph">
            <FlexibleWidthXYPlot
              onMouseLeave={onGraphMouseOut}
              className="__CitationsByYearGraph__"
              height={GRAPH_HEIGHT}
              margin={GRAPH_MARGIN}
              yDomain={[0, yDomainMax]}
            >
              {renderXAxis()}
              {renderYAxis()}
              {renderCitationsGraph()}
              {renderHint()}
            </FlexibleWidthXYPlot>
          </div>
        </EmptyOrChildren>
      </ErrorAlertOrChildren>
    </LoadingOrChildren>
  );
}

CitationsByYearGraph.defaultProps = {
  error: null,
  loading: false,
};

export default CitationsByYearGraph;
