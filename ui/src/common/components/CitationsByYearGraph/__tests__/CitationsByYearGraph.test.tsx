import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CitationsByYearGraph from '../CitationsByYearGraph';

describe('CitationsByYearGraph', () => {
  it('renders citations for more than 3 less than 8 years with tickValues for the XAxis and without dummy data', () => {
    const citationsByYear = {
      1999: 10,
      2000: 5,
      2001: 56,
      2002: 33,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders citations for less than 5 different citation counts with tickValues for the YAxis', () => {
    const citationsByYear = {
      1999: 10,
      2000: 10,
      2001: 5,
      2002: 5,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders more than 5 different citation counts without explicit tickValues for the YAxis', () => {
    const citationsByYear = {
      1999: 10,
      2000: 5,
      2001: 50,
      2002: 7,
      2003: 51,
      2004: 56,
      2005: 14,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment).toMatchSnapshot();
  });

  it('renders citations for less than 3 years with dummy data for previous 1-2 years', () => {
    const citationsByYear = {
      1999: 10,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders without citations', () => {
    const citationsByYear = {};
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders more than 8 years without explicit tickValues for the xAxis', () => {
    const citationsByYear = {
      1999: 10,
      2000: 5,
      2001: 5,
      2002: 7,
      2003: 5,
      2004: 56,
      2005: 14,
      2006: 123,
      2007: 112,
      2008: 89,
      2009: 30,
      2010: 100,
      2011: 38,
      2014: 43,
      2015: 5,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders hovered info in a tooltip on line series hover', () => {
    const citationsByYear = {
      1999: 10,
      2000: 5,
      2001: 56,
    };
    const { container } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );

    const graph = container.getElementsByClassName('rv-xy-plot__inner')[0];
    fireEvent.mouseOver(graph);

    waitFor(() =>
      expect(screen.getByText('Citations: 10')).toBeInTheDocument()
    );
  });

  it('renders filling missing years with 0', () => {
    const citationsByYear = {
      2000: 10,
      2014: 43,
      2015: 5,
    };
    const { asFragment } = render(
      <CitationsByYearGraph citationsByYear={citationsByYear} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('sets tickFormat to abbrivate values at Y axis', () => {
    const citationsByYear = {
      2000: 1234,
      2014: 15123,
      2015: 500,
    };
    render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );

    expect(screen.getByText('1.2K')).toBeInTheDocument();
    expect(screen.getByText('15K')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('renders two citations graphs when current year citations are included', () => {
    const citationsByYear = {
      2020: 5,
      2021: 16,
      2022: 33,
      2023: 10,
      2024: 10,
    };
    const { asFragment } = render(
      <CitationsByYearGraph
        citationsByYear={citationsByYear}
        loading={false}
        error={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
