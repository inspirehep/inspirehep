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
    const wrapper = shallow(<RangeAggregation
      onChange={jest.fn()}
      buckets={mockBuckets}
      name="Test"
      selections={mockSelections}
    />);
    expect(wrapper).toMatchSnapshot();
  });

  it('derives selectionMap state from prop selectedKeys', () => {

  });

  describe('sanitizeEndpoints', () => {
    it('returns [min, max] if endpoints are not present', () => {
      const endpoints = [];
      const min = 1;
      const max = 2;
      const expected = [min, max];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, min, max);
      expect(result).toEqual(expected);
    });

    it('returns [min, max] if endpoints are out of min, max', () => {
      const endpoints = [0, 3];
      const min = 1;
      const max = 2;
      const expected = [min, max];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, min, max);
      expect(result).toEqual(expected);
    });

    it('returns same endpoints if they are in min, max range', () => {
      const endpoints = [1, 2];
      const min = 0;
      const max = 3;
      const expected = [1, 2];
      const result = RangeAggregation.sanitizeEndpoints(endpoints, min, max);
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
      const data = RangeAggregation
        .getHistogramData(buckets, endpoints, RangeAggregation.defaultProps);
      expect(data).toEqual(expectedData);
    });
  });

  describe('onSliderChange', () => {
    it('calls sets new endpoints, data on state and clears highlight of previously hovered bar', () => {
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={[]}
      />);
      const prevData = wrapper.state('data');

      wrapper.instance().onSliderChange(mockEndpoints);
      expect(wrapper.state('endpoints')).toEqual(mockEndpoints);
      // TODO: mock getHistogramData
      expect(wrapper.state('data')).not.toBe(prevData);
    });
  });

  describe('onNearestBar', () => {
    it('sets hoverColor for bar at given index and keeps current color of it', () => {
      const { hoverColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />);
      const index = 0;
      const currentColor = wrapper.state('data')[index].color;
      wrapper.instance().onNearestBar(null, { index });
      expect(wrapper.state('data')[index].color).toEqual(hoverColor);
      expect(wrapper.instance().prevNearestBar).toEqual({ index, color: currentColor });
    });
  });

  describe('onBarClick', () => {
    it('calls onChange with where both endpoints equal to bar.x', () => {
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={List()}
        name="Test"
        selections={[]}
      />);
      wrapper.instance().onBarClick({ x: 2011 + HALF_BAR_WIDTH });
      expect(onChange).toHaveBeenCalledWith([2011, 2011]);
    });
  });

  describe('onAfterChange', () => {
    it('calls onChange with endpoints from state', () => {
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />);
      const endpoints = wrapper.state('endpoints');
      wrapper.instance().onAfterChange();
      expect(onChange).toHaveBeenCalledWith(endpoints);
    });
  });

  describe('onResetClick', () => {
    it('clears endpoints and call onChange with empty', () => {
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />);
      wrapper.instance().onResetClick();
      expect(wrapper.state('endpoints')).toEqual([]);
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('onNearestBar', () => {
    it('sets hoverColor for bar at given index and keeps current color of it', () => {
      const { hoverColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />);
      const index = 0;
      const currentColor = wrapper.state('data')[index].color;
      wrapper.instance().onNearestBar(null, { index });
      expect(wrapper.state('data')[index].color).toEqual(hoverColor);
      expect(wrapper.instance().prevNearestBar).toEqual({ index, color: currentColor });
    });
  });

  describe('onMouseLeaveHistogram', () => {
    it('resets color of previously hovered bar', () => {
      const { deselectedColor } = RangeAggregation.defaultProps;
      const onChange = jest.fn();
      const wrapper = shallow(<RangeAggregation
        onChange={onChange}
        buckets={mockBuckets}
        name="Test"
        selections={mockSelections}
      />);
      const index = 0;
      const component = wrapper.instance();
      component.prevNearestBar = { index, color: deselectedColor };
      component.onMouseLeaveHistogram();
      expect(wrapper.state('data')[index].color).toEqual(deselectedColor);
      expect(component.prevNearestBar).toEqual(null);
    });
  });
});
