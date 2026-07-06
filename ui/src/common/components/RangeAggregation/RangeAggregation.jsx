import { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, ComposedChart, Bar, Tooltip } from 'recharts';
import { Slider } from 'antd';
import { List } from 'immutable';
import { MathInterval } from 'math-interval-2';
import className from 'classnames';

import { pluckMinMaxPair, toNumbers, addCommasToNumber } from '../../utils';
import AggregationBox from '../AggregationBox';
import styleVariables from '../../../styleVariables';
import './RangeAggregation.less';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../constants';
import {
  AUTHOR_CITATIONS_NS,
  AUTHOR_DATA_NS,
  AUTHOR_PUBLICATIONS_NS,
  CONFERENCE_CONTRIBUTIONS_NS,
  DATA_NS,
  EXPERIMENT_PAPERS_NS,
  INSTITUTION_PAPERS_NS,
  JOURNAL_PAPERS_NS,
  LITERATURE_NS,
} from '../../../search/constants';

export const HALF_BAR_WIDTH = 0.4;
const KEY_PROP_NAME = 'key_as_string';
const COUNT_PROP_NAME = 'doc_count';
const SELECTED_COLOR = '#91d5ff';
const DESELECTED_COLOR = styleVariables['@gray-6'];
const MIN_DISPLAY_RANGE_SIZE = 30;
const HEIGHT = 100;

function getInitialHistogramData(initialBuckets, [min, max]) {
  const nonEmptyYearsData = initialBuckets
    .map((item) => {
      const key = Number(item.get(KEY_PROP_NAME));
      return {
        x: key,
        initialY: item.get(COUNT_PROP_NAME),
      };
    })
    .toArray();

  const nonEmptyYearsDataByYear = Object.fromEntries(
    nonEmptyYearsData.map((d) => [d.x, d])
  );
  const data = [];
  for (let year = min; year <= max; year++) {
    data.push(nonEmptyYearsDataByYear[year] || { x: year, initialY: 0 });
  }

  const rangeSize = max - min;
  if (rangeSize < MIN_DISPLAY_RANGE_SIZE) {
    const fakeBucketMax = min + MIN_DISPLAY_RANGE_SIZE;
    for (let year = max + 1; year <= fakeBucketMax; year++) {
      data.push({
        x: year,
        initialY: 0,
      });
    }
  }
  return data;
}

function getHistogramData(initialData, keyToCountForBuckets, [lower, upper]) {
  const data = initialData.map((item) => {
    const { x, initialY } = item;
    const bucketKey = x;
    const xIsInSelectedRange = x >= lower && x <= upper;
    const y = xIsInSelectedRange ? keyToCountForBuckets[bucketKey] || 0 : 0;
    return {
      x,
      initialY,
      y,
      remainder: Math.max(initialY - y, 0),
    };
  });
  return data;
}

function pluckMinMaxPairFromBuckets(buckets) {
  return pluckMinMaxPair(buckets, (bucket) =>
    Number(bucket.get(KEY_PROP_NAME))
  );
}

function getKeyToCountMapFromBuckets(buckets) {
  return buckets.reduce((map, item) => {
    map[item.get(KEY_PROP_NAME)] = item.get(COUNT_PROP_NAME);
    return map;
  }, {});
}

function sanitizeEndpoints(endpoints, [min, max]) {
  let [lower, upper] = endpoints;
  const bounds = MathInterval.closed(min, max);
  if (lower === undefined || !bounds.contains(lower)) {
    lower = min;
  }
  if (upper === undefined || !bounds.contains(upper)) {
    upper = max;
  }
  return [lower, upper];
}

function getSanitizedEndpointsFromSelections(selections, minMaxPair) {
  const selectionsAsString =
    selections && selections.split(RANGE_AGGREGATION_SELECTION_SEPARATOR);
  const unsafeEndpoints = toNumbers(selectionsAsString) || [];
  return sanitizeEndpoints(unsafeEndpoints, minMaxPair);
}

function getSliderMarks([lower, upper], [min, max]) {
  const totalRange = max - min;
  const selectionRange = upper - lower;
  const selectionPercentage = (selectionRange / totalRange) * 100;
  const areEndpointsTooClose =
    selectionPercentage < 20 && selectionPercentage > 0;

  const isLowerOnTheEdge = lower === min;
  const isUpperOnTheEdge = upper === max;

  return {
    [lower]: {
      label: lower,
      style: {
        transform:
          areEndpointsTooClose && !isLowerOnTheEdge
            ? `translateX(-${100 - selectionPercentage}%)`
            : 'translateX(-50%)',
      },
    },
    [upper]: {
      label: upper,
      style: {
        transform:
          areEndpointsTooClose && !isUpperOnTheEdge
            ? `translateX(-${selectionPercentage}%)`
            : 'translateX(-50%)',
      },
    },
  };
}

function getHintTitles(namespace) {
  switch (namespace) {
    case DATA_NS:
    case AUTHOR_DATA_NS:
      return {
        selectedTitle: 'Selected Datasets',
        totalTitle: 'Total Datasets',
      };
    case AUTHOR_PUBLICATIONS_NS:
    case AUTHOR_CITATIONS_NS:
    case CONFERENCE_CONTRIBUTIONS_NS:
    case EXPERIMENT_PAPERS_NS:
    case INSTITUTION_PAPERS_NS:
    case JOURNAL_PAPERS_NS:
    case LITERATURE_NS:
    default:
      return {
        selectedTitle: 'Selected Papers',
        totalTitle: 'Total Papers',
      };
  }
}

function TooltipContent(props) {
  const { active, payload, namespace, max } = props;
  if (active && payload && payload.length) {
    const firstPayload = payload[0];
    if (firstPayload == null) {
      return null;
    }
    const entry = firstPayload.payload;
    if (entry.x > max) {
      return null;
    }
    const { selectedTitle, totalTitle } = getHintTitles(namespace);
    return (
      <div className="graph-tooltip">
        <p className="ma0">{`${selectedTitle}: ${addCommasToNumber(entry.y)}`}</p>
        <p className="ma0">{`${totalTitle}: ${addCommasToNumber(entry.initialY)}`}</p>
        <p className="ma0">{`Year: ${entry.x}`}</p>
      </div>
    );
  }
  return null;
}

function RangeAggregation({
  name,
  initialBuckets,
  buckets,
  selections,
  onChange,
  namespace,
}) {
  const [initialMin, initialMax] = useMemo(
    () => pluckMinMaxPairFromBuckets(initialBuckets),
    [initialBuckets]
  );
  const initialFakeMax = Math.max(
    initialMin + MIN_DISPLAY_RANGE_SIZE,
    initialMax
  );
  const initialData = useMemo(
    () => getInitialHistogramData(initialBuckets, [initialMin, initialMax]),
    [initialBuckets, initialMin, initialMax]
  );

  const [min, max] = useMemo(
    () => pluckMinMaxPairFromBuckets(buckets),
    [buckets]
  );
  const sliderEndpointsFromProps = useMemo(
    () => getSanitizedEndpointsFromSelections(selections, [min, max]),
    [selections, min, max]
  );
  const [sliderEndpoints, setSliderEndpoints] = useState(
    sliderEndpointsFromProps
  );
  const sliderMarks = useMemo(
    () => getSliderMarks(sliderEndpoints, [initialMin, initialFakeMax]),
    [sliderEndpoints, initialMin, initialFakeMax]
  );
  const keyToCountForBuckets = useMemo(
    () => getKeyToCountMapFromBuckets(buckets),
    [buckets]
  );
  const dataFromProps = useMemo(
    () => getHistogramData(initialData, keyToCountForBuckets, sliderEndpoints),
    [initialData, keyToCountForBuckets, sliderEndpoints]
  );
  const [data, setData] = useState(dataFromProps);

  const onSliderAfterChange = useCallback(
    (endpoints = sliderEndpoints) => {
      const rangeSelectionString = endpoints.join(
        RANGE_AGGREGATION_SELECTION_SEPARATOR
      );
      onChange(rangeSelectionString);
    },
    [onChange, sliderEndpoints]
  );

  const onSliderChange = useCallback(
    ([lower, upper]) => {
      const sanitizedSliderEndpoints = sanitizeEndpoints(
        [lower, upper],
        [initialMin, initialMax]
      );
      setSliderEndpoints(sanitizedSliderEndpoints);
      const newData = getHistogramData(
        initialData,
        keyToCountForBuckets,
        sanitizedSliderEndpoints
      );
      setData(newData);
    },
    [initialMin, initialMax, initialData, keyToCountForBuckets]
  );

  const onBarClick = (item) => {
    const bucketKey = item.payload.x;
    const endpoints = [bucketKey, bucketKey];
    onSliderChange(endpoints);
    onSliderAfterChange(endpoints);
  };

  const rowClassName = className('__RangeAggregation__', {
    squeeze: sliderEndpoints[1] - sliderEndpoints[0] < 20,
    superSqueeze: sliderEndpoints[1] - sliderEndpoints[0] < 14,
  });

  return (
    <AggregationBox name={name}>
      <div className={rowClassName}>
        <ResponsiveContainer height={HEIGHT}>
          <ComposedChart data={data} barCategoryGap="6%">
            <Tooltip
              content={TooltipContent}
              isAnimationActive={false}
              cursor={false}
              namespace={namespace}
              max={initialMax}
            />
            <Bar
              shape={(props) => (
                <rect
                  x={props.x}
                  y={props.y}
                  width={Math.ceil(props.width)}
                  height={props.height}
                  fill={SELECTED_COLOR}
                  stroke={SELECTED_COLOR}
                />
              )}
              dataKey="y"
              isAnimationActive={false}
              stackId="stack"
              onClick={onBarClick}
              className="pointer highlight-bar-on-hover"
            />
            <Bar
              shape={(props) => (
                <rect
                  x={props.x}
                  y={props.y}
                  width={Math.ceil(props.width)}
                  height={props.height}
                  fill={DESELECTED_COLOR}
                  stroke={DESELECTED_COLOR}
                />
              )}
              dataKey="remainder"
              isAnimationActive={false}
              stackId="stack"
              onClick={onBarClick}
              className="pointer"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <Slider
          range
          onChange={onSliderChange}
          onAfterChange={onSliderAfterChange}
          value={sliderEndpoints}
          min={initialMin}
          max={initialFakeMax}
          marks={sliderMarks}
          included
          tooltip={{ open: false }}
        />
      </div>
    </AggregationBox>
  );
}

RangeAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  namespace: PropTypes.string,
  selections: PropTypes.string,
  buckets: PropTypes.instanceOf(List),
  initialBuckets: PropTypes.instanceOf(List),
};

RangeAggregation.defaultProps = {
  selections: null,
  buckets: List(),
  initialBuckets: List(),
};

export default RangeAggregation;
