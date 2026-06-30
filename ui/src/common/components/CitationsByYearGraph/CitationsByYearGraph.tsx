import React, { useMemo } from 'react';
import { Map } from 'immutable';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
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
const GRAPH_HEIGHT = 250;

const MIN_NUMBER_OF_DATAPOINTS = 3;
const MAX_NUMBER_OF_TICKS_AT_X = 5;
const MAX_NUMBER_OF_TICKS_AT_Y = 5;

const DOT_CONFIG = {
  stroke: 'transparent',
  fill: BLUE,
  r: 4,
};

interface GraphData {
  x: number;
  y: number;
}

function TooltipContent(props: TooltipContentProps) {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const firstPayload = payload[0];
    if (firstPayload == null) {
      return null;
    }
    const entry = firstPayload.payload;
    const citations = entry.pastYearsY ?? entry.currentYearY;
    return (
      <div
        style={{
          backgroundColor: '#3a3a48',
          borderRadius: '4px',
          color: 'white',
          fontSize: '12px',
          padding: '7px 10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        <p
          style={{ margin: 0 }}
        >{`${pluralizeUnlessSingle('Citation', citations)}: ${addCommasToNumber(citations)}`}</p>
        <p style={{ margin: 0 }}>{`Year: ${entry.x}`}</p>
      </div>
    );
  }
  return null;
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
  const currentYear = new Date().getFullYear();

  const seriesData = useMemo<GraphData[]>(() => {
    const years = Object.keys(citationsByYear).map(Number);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const result: GraphData[] = [];

    for (let year = minYear; year <= maxYear; year++) {
      const citations = citationsByYear[year] || 0;
      result.push({ x: year, y: citations });
    }

    const missingSeries = MIN_NUMBER_OF_DATAPOINTS - result.length;
    if (missingSeries > 0 && result.length > 0) {
      for (let i = 0; i < missingSeries; i++) {
        const firstX: number = result[0].x;
        result.unshift({ x: firstX - 1, y: 0 });
      }
    }

    return result;
  }, [citationsByYear]);

  const max =
    seriesData.length > 0 ? Math.max(...seriesData.map((d) => d.y)) : 0;

  const data = seriesData.map((item) => ({
    x: item.x,
    pastYearsY: item.x <= currentYear - 1 ? item.y : undefined,
    currentYearY: item.x >= currentYear - 1 ? item.y : undefined,
  }));

  function renderXAxis() {
    const valuesAtX = seriesData.map((point) => point.x);
    const tickValuesAtX =
      seriesData.length < MAX_NUMBER_OF_TICKS_AT_X
        ? valuesAtX
        : pickEvenlyDistributedElements(valuesAtX, MAX_NUMBER_OF_TICKS_AT_X);
    return (
      <XAxis
        ticks={tickValuesAtX}
        tickFormatter={(value) => value /* avoid comma per 3 digit */}
        dataKey="x"
        fontSize="11px"
      />
    );
  }

  function renderYAxis() {
    const uniqueValues = [...new Set(seriesData.map((point) => point.y))];
    const tickValuesAtY =
      uniqueValues.length < MAX_NUMBER_OF_TICKS_AT_Y
        ? [...uniqueValues].sort((a, b) => a - b)
        : undefined;
    return (
      <YAxis
        ticks={tickValuesAtY}
        tickCount={MAX_NUMBER_OF_TICKS_AT_Y}
        tickFormatter={abbreviateNumber}
        domain={[0, max]}
        minTickGap={2}
        fontSize="11px"
      />
    );
  }

  return (
    <LoadingOrChildren loading={loading}>
      <ErrorAlertOrChildren error={error}>
        <EmptyOrChildren data={citationsByYear} title="0 Citations">
          <div data-test-id="citations-by-year-graph">
            <ResponsiveContainer height={GRAPH_HEIGHT}>
              <LineChart
                data={data}
                margin={{ left: -10, right: 20, top: 10, bottom: 0 }}
              >
                <Tooltip
                  isAnimationActive={false}
                  cursor={false}
                  content={TooltipContent}
                />
                {renderXAxis()}
                {renderYAxis()}
                <Line
                  dataKey="pastYearsY"
                  stroke={BLUE}
                  strokeWidth={2}
                  dot={DOT_CONFIG}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="currentYearY"
                  stroke={LIGHT_BLUE}
                  strokeDasharray="7 3"
                  strokeWidth={2}
                  dot={DOT_CONFIG}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
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
