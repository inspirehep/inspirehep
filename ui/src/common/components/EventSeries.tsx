import React, { useCallback } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { addOrdinalSuffix } from '../utils';
import InlineList, { SEPARATOR_AND } from './InlineList';
import { CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE } from '../constants';

function extractKeyFromSeriesItem(seriesItem: any) {
  return seriesItem.get('name');
}

function EventSeries({
  series,
  pidType
}: any) {
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      items={series}
      separator={SEPARATOR_AND}
      renderItem={renderSeries}
      extractKey={extractKeyFromSeriesItem}
    />
  );
}

EventSeries.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  series: PropTypes.instanceOf(List).isRequired,
  pidType: PropTypes.oneOf([CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE])
    .isRequired,
};

export default EventSeries;
