import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { XYPlot, VerticalBarSeries } from 'react-vis';
import { Slider } from 'antd';
import { List } from 'immutable';
import { MathInterval } from 'math-interval-2';

import { pluckMinMaxPair } from '../utils';

const ANT_SLIDER_HANDLER_RADIUS = 7;
const NO_MARGIN = {
  left: 0, right: 0, top: 0, bottom: 0,
};

class SelectBox extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const prevItems = prevState.items;
    const nextItems = nextProps.items;
    // TODO: perhaps add more checks for other props
    if (nextItems !== prevItems) {
      const { keyPropName } = nextProps;

      let [lower, upper] = nextProps.endpoints;
      const [min, max] = pluckMinMaxPair(nextItems, item => Number(item.get(keyPropName)));
      if (lower === undefined || lower < min || lower > upper) {
        lower = min;
      }
      if (upper === undefined || upper > max || upper < min) {
        upper = max;
      }
      const endpoints = [lower, upper];
      const data = SelectBox.getHistogramData(nextItems, endpoints, nextProps);

      return {
        ...prevState,
        items: nextItems,
        endpoints,
        min,
        max,
        data,
      };
    }
    return prevState;
  }

  static getHistogramData(items, endpoints, props) {
    const [lower, upper] = endpoints;
    const interval = MathInterval.closed(lower, upper);
    const {
      keyPropName, countPropName, selectedColor, deselectedColor,
    } = props;
    return items
      .map((item) => {
        const x = Number(item.get(keyPropName));
        const color = interval.contains(x) ? selectedColor : deselectedColor;
        return {
          x,
          y: item.get(countPropName),
          color,
        };
      }).toArray();
  }

  constructor(props) {
    super(props);
    this.onBarClick = this.onBarClick.bind(this);
    this.onNearestBar = this.onNearestBar.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {};
    this.prevNearestBar = null;
  }

  onBarClick(datapoint) {
    const { x } = datapoint;
    this.onChange([x, x]);
  }

  onNearestBar(datapoint, { index }) {
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

  onChange(endpoints) {
    const { items } = this.state;
    const data = SelectBox.getHistogramData(items, endpoints, this.props);
    this.setState({ endpoints, data });
    if (this.props.onChange) {
      const [lower, upper] = endpoints;
      this.props.onChange(lower, upper);
    }
    this.prevNearestBar = null;
  }
  render() {
    const {
      max, min, data, endpoints,
    } = this.state;
    const sliderMarks = { [max]: max, [min]: min };
    const { width, height } = this.props;
    return (
      <div style={{ margin: 14 }}>
        <XYPlot
          style={{ margin: ANT_SLIDER_HANDLER_RADIUS }}
          width={width}
          height={height}
          margin={NO_MARGIN}
        >
          <VerticalBarSeries
            colorType="literal"
            data={data}
            onValueClick={this.onBarClick}
            onNearestX={this.onNearestBar}
          />
        </XYPlot>
        <Slider
          style={{ width }}
          range
          onChange={this.onChange}
          value={endpoints}
          min={min}
          max={max}
          marks={sliderMarks}
        />
      </div>
    );
  }
}

SelectBox.propTypes = {
  onChange: PropTypes.func,
  height: PropTypes.number,
  width: PropTypes.number,
  hoverColor: PropTypes.string,
  /* eslint-disable react/no-unused-prop-types */
  selectedColor: PropTypes.string,
  deselectedColor: PropTypes.string,
  endpoints: PropTypes.arrayOf(PropTypes.number),
  items: PropTypes.instanceOf(List),
  keyPropName: PropTypes.string,
  countPropName: PropTypes.string,
  /* eslint-disable react/no-unused-prop-types */
};

SelectBox.defaultProps = {
  onChange: null,
  items: List(),
  keyPropName: 'key_as_string',
  countPropName: 'doc_count',
  endpoints: [0, 0],
  height: 100,
  width: 200,
  selectedColor: '#91d5ff',
  deselectedColor: '#fff',
  hoverColor: '#69c0ff',
};

export default SelectBox;
