import React, { useCallback } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { List } from 'immutable';
import { addOrdinalSuffix } from '../utils';
import InlineList, { SEPARATOR_AND } from './InlineList';
import { CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE } from '../constants';

function extractKeyFromSeriesItem(seriesItem: $TSFixMe) {
  return seriesItem.get('name');
}

type Props = {
    series: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    pidType: $TSFixMe; // TODO: PropTypes.oneOf([CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE])
};

function EventSeries({ series, pidType }: Props) {
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
    <InlineList
      items={series}
      separator={SEPARATOR_AND}
      renderItem={renderSeries}
      extractKey={extractKeyFromSeriesItem}
    />
  );
}

export default EventSeries;
