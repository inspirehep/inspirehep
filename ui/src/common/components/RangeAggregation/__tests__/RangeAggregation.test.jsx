import React from 'react';
import { fromJS, List } from 'immutable';
import { shallow } from 'enzyme';

import RangeAggregation, { HALF_BAR_WIDTH } from '../RangeAggregation';

const { keyPropName, countPropName } = RangeAggregation.defaultProps;
const mockBuckets = fromJS([
  {
    key: 2010,
    [countPropName]: 1,
    [keyPropName]: '2010',
  },
  {
    key: 2011,
    doc_count: 2,
    [keyPropName]: '2011',
  },
  {
    key: 2012,
    [countPropName]: 3,
    [keyPropName]: '2012',
  },
]);
const mockSelections = ['2011', '2012'];
const mockEndpoints = [2011, 2012];

describe('RangeAggregation', () => {
  it('render initial state with all required props set', () => {
    const wrapper = shallow(
      <RangeAggregation
        onChange={jest.fn()}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
        minRangeSize={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with sanitized endpoints', () => {
    const wrapper = shallow(
      <RangeAggregation
        onChange={jest.fn()}
        buckets={mockBuckets}
        name="Test"
        selections={['1000', '3000']}
        minRangeSize={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render with sanitized min-max according to default minRangeSize', () => {
    const wrapper = shallow(
      <RangeAggregation
        onChange={jest.fn()}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with hovered bar', () => {
    const wrapper = shallow(
      <RangeAggregation
        onChange={jest.fn()}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
        minRangeSize={1}
      />
    );
    wrapper.setState({ hoveredBar: { x: 1, y: 2 } });
    expect(wrapper).toMatchSnapshot();
  });

  describe('sanitizeEndpoints', () => {
    it('returns [min, max] if endpoints are not present', () => {
      const endpoints = [];
      const min = 1;
      const max = 2;
      const expected = [min, max];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, [min, max]);
      expect(result).toEqual(expected);
    });

    it('returns [min, max] if endpoints are out of min, max', () => {
      const endpoints = [0, 3];
      const min = 1;
      const max = 2;
      const expected = [min, max];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, [min, max]);
      expect(result).toEqual(expected);
    });

    it('returns same endpoints if they are in min, max range', () => {
      const endpoints = [1, 2];
      const min = 0;
      const max = 3;
      const expected = [1, 2];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, [min, max]);
      expect(result).toEqual(expected);
    });
  });

  describe('sanitizeMinMaxForMinRangeSize', () => {
    it('returns [min, max] if range size is bigger than minRangeSize', () => {
      const min = 1;
      const max = 5;
      const expected = [min, max];
      const result = RangeAggregation.sanitizeMinMaxPairForMinRangeSize(
        [min, max],
        2
      );
      expect(result).toEqual(expected);
    });

    it('returns sanitized [min, max] if range size smaller than minRangeSize [difference is odd number]', () => {
      const min = 5;
      const max = 10;
      const expected = [3, 12];
      const result = RangeAggregation.sanitizeMinMaxPairForMinRangeSize(
        [min, max],
        10
      );
      expect(result).toEqual(expected);
    });

    it('returns sanitized [min, max] if range size smaller than minRangeSize [difference is even number]', () => {
      const min = 6;
      const max = 10;
      const expected = [3, 13];
      const result = RangeAggregation.sanitizeMinMaxPairForMinRangeSize(
        [min, max],
        10
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getHistogramData', () => {
    it('returns histogram data with colors according to endpoints', () => {
      const { selectedColor, deselectedColor } = RangeAggregation.defaultProps;
      const buckets = fromJS([
        {
          key: 201000,
          [countPropName]: 1,
          [keyPropName]: '2010',
        },
        {
          key: 201100,
          [countPropName]: 2,
          [keyPropName]: '2011',
        },
        {
          key: 201200,
          [countPropName]: 3,
          [keyPropName]: '2012',
        },
      ]);
      const endpoints = [2011, 2012];
      const expectedData = [
        {
          x0: 2010 - HALF_BAR_WIDTH,
          x: 2010 + HALF_BAR_WIDTH,
          y: 1,
          color: deselectedColor,
        },
        {
          x0: 2011 - HALF_BAR_WIDTH,
          x: 2011 + HALF_BAR_WIDTH,
          y: 2,
          color: selectedColor,
        },
        {
          x0: 2012 - HALF_BAR_WIDTH,
          x: 2012 + HALF_BAR_WIDTH,
          y: 3,
          color: selectedColor,
        },
      ];
      const data = RangeAggregation.getHistogramData(
        buckets,
        endpoints,
        RangeAggregation.defaultProps,
        endpoints
      );
      expect(data).toEqual(expectedData);
    });

    it('returns histogram data with colors and fake min-max data points if min-max pairs not equal to endpoints ', () => {
      const { selectedColor, deselectedColor } = RangeAggregation.defaultProps;
      const buckets = fromJS([
        {
          key: 201000,
          [countPropName]: 1,
          [keyPropName]: '2010',
        },
        {
          key: 201100,
          [countPropName]: 2,
          [keyPropName]: '2011',
        },
        {
          key: 201200,
          [countPropName]: 3,
          [keyPropName]: '2012',
        },
      ]);
      const endpoints = [2011, 2012];
      const expectedData = [
        {
          x0: 2010 - HALF_BAR_WIDTH,
          x: 2010 + HALF_BAR_WIDTH,
          y: 1,
          color: deselectedColor,
        },
        {
          x0: 2011 - HALF_BAR_WIDTH,
          x: 2011 + HALF_BAR_WIDTH,
          y: 2,
          color: selectedColor,
        },
        {
          x0: 2012 - HALF_BAR_WIDTH,
          x: 2012 + HALF_BAR_WIDTH,
          y: 3,
          color: selectedColor,
        },
        {
          x0: 1000 - HALF_BAR_WIDTH,
          x: 1000 + HALF_BAR_WIDTH,
          y: 0,
        },
        {
          x0: 3000 - HALF_BAR_WIDTH,
          x: 3000 + HALF_BAR_WIDTH,
          y: 0,
        },
      ];
      const data = RangeAggregation.getHistogramData(
        buckets,
        endpoints,
        RangeAggregation.defaultProps,
        [1000, 3000]
      );
      expect(data).toEqual(expectedData);
    });
  });

  describe('onSliderChange', () => {
    it('calls sets new endpoints, data on state and clears highlight of previously hovered bar', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={[]}
        />
      );
      const prevData = wrapper.state('data');
      wrapper.instance().onSliderChange(mockEndpoints);
      wrapper.update();
      expect(wrapper.state('endpoints')).toEqual(mockEndpoints);
      // TODO: mock getHistogramData
      expect(wrapper.state('data')).not.toBe(prevData);
    });
  });

  describe('onNearestBar', () => {
    it('sets hoverColor for bar at given index and keeps current color of it', () => {
      const { hoverColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={mockSelections}
        />
      );
      const index = 0;
      const currentColor = wrapper.state('data')[index].color;
      wrapper.instance().onNearestBar(null, { index });
      expect(wrapper.state('data')[index].color).toEqual(hoverColor);
      expect(wrapper.instance().prevNearestBar).toEqual({
        index,
        color: currentColor,
      });
    });
  });

  describe('onBarClick', () => {
    it('calls onChange with where both endpoints equal to bar.x', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={List()}
          name="Test"
          selections={[]}
        />
      );
      wrapper.instance().onBarClick({ x: 2011 + HALF_BAR_WIDTH });
      expect(onChange).toHaveBeenCalledWith([2011, 2011]);
    });
  });

  describe('onBarMouseHover', () => {
    it('sets hoveredBar state', () => {
      const wrapper = shallow(
        <RangeAggregation
          onChange={jest.fn()}
          buckets={List()}
          name="Test"
          selections={[]}
        />
      );
      const bar = { x: 1, y: 2 };
      wrapper.instance().onBarMouseHover(bar);
      expect(wrapper.state('hoveredBar')).toEqual(bar);
    });
  });

  describe('onBarMouseOut', () => {
    it('sets hoveredBar state to null', () => {
      const wrapper = shallow(
        <RangeAggregation
          onChange={jest.fn()}
          buckets={List()}
          name="Test"
          selections={[]}
        />
      );
      wrapper.setState({ hoveredBar: { x: 1, y: 2 } });
      wrapper.instance().onBarMouseOut();
      expect(wrapper.state('hoveredBar')).toEqual(null);
    });
  });

  describe('onAfterChange', () => {
    it('calls onChange with endpoints from state', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={mockSelections}
        />
      );
      const endpoints = wrapper.state('endpoints');
      wrapper.instance().onAfterChange();
      expect(onChange).toHaveBeenCalledWith(endpoints);
    });
  });

  describe('onResetClick', () => {
    it('clears endpoints and call onChange with empty', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={mockSelections}
        />
      );
      wrapper.instance().onResetClick();
      wrapper.update();
      expect(wrapper.state('endpoints')).toEqual([]);
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('onNearestBar', () => {
    it('sets hoverColor for bar at given index and keeps current color of it', () => {
      const { hoverColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={mockSelections}
        />
      );
      const index = 0;
      const currentColor = wrapper.state('data')[index].color;
      wrapper.instance().onNearestBar(null, { index });
      expect(wrapper.state('data')[index].color).toEqual(hoverColor);
      expect(wrapper.instance().prevNearestBar).toEqual({
        index,
        color: currentColor,
      });
    });
  });

  describe('onMouseLeaveHistogram', () => {
    it('resets color of previously hovered bar', () => {
      const { deselectedColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(
        <RangeAggregation
          onChange={onChange}
          buckets={mockBuckets}
          name="Test"
          selections={mockSelections}
        />
      );
      const index = 0;
      const component = wrapper.instance();
      component.prevNearestBar = { index, color: deselectedColor };
      component.onMouseLeaveHistogram();
      expect(wrapper.state('data')[index].color).toEqual(deselectedColor);
      expect(component.prevNearestBar).toEqual(null);
    });
  });
});
