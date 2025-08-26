import React from 'react';
import { fromJS } from 'immutable';
import { renderWithRouter } from '../../../fixtures/render';
import EventSeries from '../EventSeries';
import { CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE } from '../../constants';

describe('EventSeries', () => {
  it('renders with only name', () => {
    const series = fromJS([{ name: 'Conference Name' }]);
    const { getByText, getByRole } = renderWithRouter(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );
    const link = getByRole('link', {
      name: 'Conference Name',
    });
    expect(link).toHaveAttribute(
      'href',
      '/conferences?q=series.name:"Conference Name"&start_date=all'
    );
    expect(getByText('Part of the')).toBeInTheDocument();
  });

  it('renders conference series with name and number', () => {
    const series = fromJS([{ name: 'Conference Name', number: 10 }]);
    const { getByText, getByRole } = renderWithRouter(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );
    const link = getByRole('link', {
      name: 'Conference Name',
    });
    expect(link).toHaveAttribute(
      'href',
      '/conferences?q=series.name:"Conference Name"&start_date=all'
    );
    expect(getByText('10th conference in the')).toBeInTheDocument();
  });

  it('renders several series', () => {
    const series = fromJS([
      { name: 'Conference 1' },
      { name: 'Conference 2', number: 10 },
      { name: 'Conference 3' },
    ]);
    const { getByText, getByRole } = renderWithRouter(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );

    const link = getByRole('link', {
      name: 'Conference 1',
    });
    expect(link).toHaveAttribute(
      'href',
      '/conferences?q=series.name:"Conference 1"&start_date=all'
    );
    expect(getByText('Part of the')).toBeInTheDocument();
    const link1 = getByRole('link', {
      name: 'Conference 2',
    });
    expect(link1).toHaveAttribute(
      'href',
      '/conferences?q=series.name:"Conference 2"&start_date=all'
    );
    expect(getByText('10th conference in the')).toBeInTheDocument();
    const link2 = getByRole('link', {
      name: 'Conference 3',
    });
    expect(link2).toHaveAttribute(
      'href',
      '/conferences?q=series.name:"Conference 3"&start_date=all'
    );
    expect(getByText('part of the')).toBeInTheDocument();
  });

  it('renders seminar series with name and number', () => {
    const series = fromJS([{ name: 'Seminar Name', number: 10 }]);
    const { getByText, getByRole } = renderWithRouter(
      <EventSeries series={series} pidType={SEMINARS_PID_TYPE} />
    );
    const link = getByRole('link', {
      name: 'Seminar Name',
    });
    expect(link).toHaveAttribute(
      'href',
      '/seminars?q=series.name:"Seminar Name"&start_date=all'
    );
    expect(getByText('10th seminar in the')).toBeInTheDocument();
  });
});
