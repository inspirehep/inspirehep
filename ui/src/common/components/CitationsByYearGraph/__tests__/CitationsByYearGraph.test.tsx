import React from 'react';
import { shallow } from 'enzyme';
import { LineSeries, YAxis } from 'react-vis';

import CitationsByYearGraph from '../CitationsByYearGraph';

describe('CitationsByYearGraph', () => {
  it('renders citations for more than 3 less than 8 years with tickValues for the XAxis and without dummy data', () => {
    const citationsByYear = {
      '1999': 10,
      '2000': 5,
      '2001': 56,
      '2002': 33,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders citations for less than 5 different citation counts with tickValues for the YAxis', () => {
    const citationsByYear = {
      '1999': 10,
      '2000': 10,
      '2001': 5,
      '2002': 5,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders more than 5 different citation counts without explicit tickValues for the YAxis', () => {
    const citationsByYear = {
      '1999': 10,
      '2000': 5,
      '2001': 50,
      '2002': 7,
      '2003': 51,
      '2004': 56,
      '2005': 14,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders citations for less than 3 years with dummy data for previous 1-2 years', () => {
    const citationsByYear = {
      '1999': 10,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without citations', () => {
    const citationsByYear = {};
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders more than 8 years without explicit tickValues for the xAxis', () => {
    const citationsByYear = {
      '1999': 10,
      '2000': 5,
      '2001': 5,
      '2002': 7,
      '2003': 5,
      '2004': 56,
      '2005': 14,
      '2006': 123,
      '2007': 112,
      '2008': 89,
      '2009': 30,
      '2010': 100,
      '2011': 38,
      '2014': 43,
      '2015': 5,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders hovered info in a tooltip on line series hover', () => {
    const citationsByYear = {
      '1999': 10,
      '2000': 5,
      '2001': 56,
    };
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    const onLineSeriesHover = wrapper.find(LineSeries).prop('onNearestX');
    onLineSeriesHover({ x: 1999, y: 10 });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders filling missing years with 0', () => {
    const citationsByYear = {
      '2000': 10,
      '2014': 43,
      '2015': 5,
    };
    const wrapper = shallow(
      <CitationsByYearGraph citationsByYear={citationsByYear} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets tickFormat to abbrivate values at Y axis', () => {
    const citationsByYear = {};
    const wrapper = shallow(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={null}
      />
    );
    const tickFormat = wrapper.find(YAxis).prop('tickFormat');

    expect(tickFormat(1234)).toEqual('1.2K');
    expect(tickFormat(15123)).toEqual('15K');
    expect(tickFormat(500)).toEqual(500);
  });
});
