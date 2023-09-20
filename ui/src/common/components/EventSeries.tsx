import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { List, Map } from 'immutable';

import { addOrdinalSuffix } from '../utils';
import InlineDataList, { SEPARATOR_AND } from './InlineList';
import { CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE } from '../constants';

function extractKeyFromSeriesItem(seriesItem: Map<string, any>) {
  return seriesItem.get('name');
}

function EventSeries({
  series,
  pidType,
}: {
  series: List<any>;
  pidType: string;
}) {
  const renderSeries = useCallback(
    (singleSeries, index) => {
      const name = singleSeries.get('name');
      const number = singleSeries.get('number');
      const eventType =
        pidType === CONFERENCES_PID_TYPE ? 'conference' : 'seminar';
      return (
        <span>
          {number ? (
            <span>
              {addOrdinalSuffix(number)} {eventType} in the{' '}
            </span>
          ) : (
            <span>{index === 0 ? 'P' : 'p'}art of the </span>
          )}
          <Link to={`/${pidType}?q=series.name:"${name}"&start_date=all`}>
            {name}
          </Link>
          {' series'}
        </span>
      );
    },
    [pidType]
  );

  return (
    <InlineDataList
      items={series}
      separator={SEPARATOR_AND}
      renderItem={renderSeries}
      extractKey={extractKeyFromSeriesItem}
    />
  );
}

export default EventSeries;
