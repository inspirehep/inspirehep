import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { addOrdinalSuffix } from '../utils';
import { CONFERENCES } from '../routes';
import InlineList, { SEPARATOR_AND } from './InlineList';

function extractKeyFromSeriesItem(seriesItem) {
  return seriesItem.get('name');
}

function renderSeries(singleSeries, index) {
  const name = singleSeries.get('name');
  const number = singleSeries.get('number');
  return (
    <span>
      {number ? (
        <span>{addOrdinalSuffix(number)} conference in the </span>
      ) : (
        <span>{index === 0 ? 'P' : 'p'}art of the </span>
      )}
      <Link to={`${CONFERENCES}?q=series.name:"${name}"&start_date=all`}>
        {name}
      </Link>
      {' series'}
    </span>
  );
}

function EventSeries({ series }) {
  return (
    <InlineList
      items={series}
      separator={SEPARATOR_AND}
      renderItem={renderSeries}
      extractKey={extractKeyFromSeriesItem}
    />
  );
}

EventSeries.propTypes = {
  series: PropTypes.instanceOf(List).isRequired,
};

export default EventSeries;
