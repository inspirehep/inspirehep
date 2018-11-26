import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlexibleWidthXYPlot, VerticalRectSeries } from 'react-vis';
import { Slider } from 'antd';
import { List } from 'immutable';
import { MathInterval } from 'math-interval-2';

import './RangeAggregation.scss';
import AggregationBox from '../AggregationBox';
import { pluckMinMaxPair, toNumbers } from '../../utils';

export const HALF_BAR_WIDTH = 0.4;
const NO_MARGIN = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const SELECTION_SEPARATOR = '--';

class RangeAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const prevBuckets = prevState.buckets;
    const nextBuckets = nextProps.buckets;
    const selectionsAsString =
      nextProps.selections && nextProps.selections.split(SELECTION_SEPARATOR);
    const selectionsAsNumber = toNumbers(selectionsAsString);
    const prevEndpoints = prevState.endpoints || [];
    const { keyPropName } = nextProps;

    let { min, max } = prevState;
    if (nextBuckets !== prevBuckets) {
      [min, max] = pluckMinMaxPair(nextBuckets, bucket =>
        Number(bucket.get(keyPropName))
      );
    }

    const unsafeEndpoints = selectionsAsNumber || prevEndpoints;
    const endpoints = RangeAggregation.sanitizeEndpoints(unsafeEndpoints, [
      min,
      max,
    ]);

    // TODO: perhaps add more checks for other props
    let { data } = prevState;
    if (nextBuckets !== prevBuckets) {
      const { minRangeSize, maximumMax } = nextProps;
      [min, max] = RangeAggregation.sanitizeMinMaxPairForMinRangeSize(
        [min, max],
        minRangeSize,
        maximumMax
      );
      data = RangeAggregation.getHistogramData(
        nextBuckets,
        endpoints,
        nextProps,
        [min, max]
      );
    }

    return {
      ...prevState,
      buckets: nextBuckets,
      endpoints,
      min,
      max,
      data,
    };
  }

  static sanitizeMinMaxPairForMinRangeSize(
    minMaxPair,
    minRangeSize,
    maximumMax
  ) {
    let [min, max] = minMaxPair;
    const rangeSize = max - min;
    if (rangeSize < minRangeSize) {
      const remainingToMinRangeSize = Math.floor(
        (minRangeSize - rangeSize) / 2
      );

      min -= remainingToMinRangeSize;
      max += remainingToMinRangeSize;

      if (max > maximumMax) {
        const extraForMin = max - maximumMax;
        max = maximumMax;
        min -= extraForMin;
      }
    }
    return [min, max];
  }

  static sanitizeEndpoints(endpoints, [min, max]) {
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

  static getHistogramData(buckets, endpoints, props, [min, max]) {
    const [lower, upper] = endpoints;
    const interval = MathInterval.closed(lower, upper);

    const {
      keyPropName,
      countPropName,
      selectedColor,
      deselectedColor,
    } = props;
    const data = buckets
      .map(item => {
        const x = Number(item.get(keyPropName));
        const color = interval.contains(x) ? selectedColor : deselectedColor;
        return {
          x0: x - HALF_BAR_WIDTH,
          x: x + HALF_BAR_WIDTH,
          y: item.get(countPropName),
          color,
        };
      })
      .toArray();
    // add fake min and max data if necessary.
    if (min !== lower) {
      data.push({
        x0: min - HALF_BAR_WIDTH,
        x: min + HALF_BAR_WIDTH,
        y: 0,
      });
    }
    if (max !== upper) {
      data.push({
        x0: max - HALF_BAR_WIDTH,
        x: max + HALF_BAR_WIDTH,
        y: 0,
      });
    }
    return data;
  }

  constructor(props) {
    super(props);
    this.onBarClick = this.onBarClick.bind(this);
    this.onBarMouseHover = this.onBarMouseHover.bind(this);
    this.onBarMouseOut = this.onBarMouseOut.bind(this);
    this.onNearestBar = this.onNearestBar.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.onAfterChange = this.onAfterChange.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
    this.onMouseLeaveHistogram = this.onMouseLeaveHistogram.bind(this);
    this.state = {};
    this.prevNearestBar = null;
  }

  onBarClick(datapoint) {
    let { x } = datapoint;
    x -= HALF_BAR_WIDTH;
    const endpoints = [x, x];
    this.onSliderChange(endpoints);
    this.onAfterChange(endpoints);
  }

  onBarMouseHover(hoveredBar) {
    this.setState({ hoveredBar });
  }

  onBarMouseOut() {
    this.setState({ hoveredBar: null });
  }

  onNearestBar(_, { index }) {
    const { data } = this.state;

    if (this.prevNearestBar !== null) {
      data[this.prevNearestBar.index].color = this.prevNearestBar.color;
    }

    const previousColor = data[index].color;
    const { hoverColor } = this.props;
    data[index].color = hoverColor;
    this.setState({ data });

    this.prevNearestBar = { index, color: previousColor };
  }

  onMouseLeaveHistogram() {
    const { data } = this.state;
    if (this.prevNearestBar !== null) {
      data[this.prevNearestBar.index].color = this.prevNearestBar.color;
      this.prevNearestBar = null;
      this.setState({ data });
    }
  }

  onResetClick() {
    const endpoints = [];
    this.setState({ endpoints });
    this.onAfterChange(endpoints);
  }

  onSliderChange(endpoints) {
    const { buckets, min, max } = this.state;
    const data = RangeAggregation.getHistogramData(
      buckets,
      endpoints,
      this.props,
      [min, max]
    );
    this.setState({ endpoints, data });
    this.prevNearestBar = null;
  }

  onAfterChange({ endpoints } = this.state) {
    const rangeSelectionString =
      endpoints.join(SELECTION_SEPARATOR) || undefined;
    const { onChange } = this.props;
    onChange(rangeSelectionString);
  }

  renderResetButton() {
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
    return <a onClick={this.onResetClick}>Reset</a>;
  }

  render() {
    const { max, min, data, endpoints, hoveredBar } = this.state;
    const sliderMarks = { [max]: max, [min]: min };
    const { height, name } = this.props;
    return (
      <AggregationBox name={name} headerAction={this.renderResetButton()}>
        <div className="__RangeAggregation__">
          <div className="hovered-info-container">
            {hoveredBar && (
              <span className="hovered-info">
                {hoveredBar.y} found for {hoveredBar.x - HALF_BAR_WIDTH}
              </span>
            )}
          </div>
          <FlexibleWidthXYPlot
            height={height}
            margin={NO_MARGIN}
            onMouseLeave={this.onMouseLeaveHistogram}
          >
            <VerticalRectSeries
              colorType="literal"
              data={data}
              onValueClick={this.onBarClick}
              onNearestX={this.onNearestBar}
              onValueMouseOver={this.onBarMouseHover}
              onValueMouseOut={this.onBarMouseOut}
            />
          </FlexibleWidthXYPlot>
          <Slider
            range
            onChange={this.onSliderChange}
            onAfterChange={this.onAfterChange}
            value={endpoints}
            min={min}
            max={max}
            marks={sliderMarks}
            included={max !== min}
          />
        </div>
      </AggregationBox>
    );
  }
}

RangeAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  height: PropTypes.number,
  hoverColor: PropTypes.string,
  name: PropTypes.string.isRequired,
  /* eslint-disable react/no-unused-prop-types */
  selections: PropTypes.string,
  selectedColor: PropTypes.string,
  deselectedColor: PropTypes.string,
  buckets: PropTypes.instanceOf(List),
  keyPropName: PropTypes.string,
  countPropName: PropTypes.string,
  minRangeSize: PropTypes.number,
  maximumMax: PropTypes.number,
  /* eslint-disable react/no-unused-prop-types */
};

RangeAggregation.defaultProps = {
  selections: null,
  buckets: List(),
  keyPropName: 'key_as_string',
  countPropName: 'doc_count',
  height: 100,
  selectedColor: '#91d5ff',
  deselectedColor: '#fff',
  hoverColor: '#69c0ff',
  minRangeSize: 50,
  maximumMax: new Date().getFullYear(), // FIXME: awkward default for a generic range filter
};

export default RangeAggregation;
