import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlexibleWidthXYPlot, VerticalRectSeries } from 'react-vis';
import { Slider } from 'antd';
import { List } from 'immutable';
import { MathInterval } from 'math-interval-2';

import AggregationBox from './AggregationBox';
import { pluckMinMaxPair, toNumbers } from '../utils';

export const HALF_BAR_WIDTH = 0.5;
const NO_MARGIN = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

class RangeAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const prevBuckets = prevState.buckets;
    const nextBuckets = nextProps.buckets;
    const selections = toNumbers(nextProps.selections);
    const prevEndpoints = prevState.endpoints || [];
    const { keyPropName } = nextProps;

    let { min, max } = prevState;
    if (nextBuckets !== prevBuckets) {
      [min, max] = pluckMinMaxPair(nextBuckets, bucket =>
        Number(bucket.get(keyPropName))
      );
    }

    const unsafeEndpoints = selections || prevEndpoints;
    const endpoints = RangeAggregation.sanitizeEndpoints(
      unsafeEndpoints,
      min,
      max
    );

    // TODO: perhaps add more checks for other props
    let { data } = prevState;
    if (nextBuckets !== prevBuckets) {
      data = RangeAggregation.getHistogramData(
        nextBuckets,
        endpoints,
        nextProps
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

  static sanitizeEndpoints(endpoints, min, max) {
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

  static getHistogramData(buckets, endpoints, props) {
    const [lower, upper] = endpoints;
    const interval = MathInterval.closed(lower, upper);
    const {
      keyPropName,
      countPropName,
      selectedColor,
      deselectedColor,
    } = props;
    return buckets
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
  }

  constructor(props) {
    super(props);
    this.onBarClick = this.onBarClick.bind(this);
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
      this.setState({ data });
      this.prevNearestBar = null;
    }
  }

  onResetClick() {
    const endpoints = [];
    this.setState({ endpoints });
    this.onAfterChange(endpoints);
  }

  onSliderChange(endpoints) {
    const { buckets } = this.state;
    const data = RangeAggregation.getHistogramData(
      buckets,
      endpoints,
      this.props
    );
    this.setState({ endpoints, data });
    this.prevNearestBar = null;
  }

  onAfterChange(endpoints = this.state.endpoints) {
    this.props.onChange(endpoints);
  }

  renderResetButton() {
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
    return <a onClick={this.onResetClick}>Reset</a>;
  }

  render() {
    const { max, min, data, endpoints } = this.state;
    const sliderMarks = { [max]: max, [min]: min };
    const { height, name } = this.props;
    return (
      <AggregationBox name={name} headerAction={this.renderResetButton()}>
        <div className="ma2">
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
  selections: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedColor: PropTypes.string,
  deselectedColor: PropTypes.string,
  buckets: PropTypes.instanceOf(List),
  keyPropName: PropTypes.string,
  countPropName: PropTypes.string,
  /* eslint-disable react/no-unused-prop-types */
};

RangeAggregation.defaultProps = {
  buckets: List(),
  keyPropName: 'key_as_string',
  countPropName: 'doc_count',
  height: 100,
  selectedColor: '#91d5ff',
  deselectedColor: '#fff',
  hoverColor: '#69c0ff',
};

export default RangeAggregation;
