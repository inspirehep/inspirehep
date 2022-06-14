import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function extractSeries(bookSeries) {
  return bookSeries.get('title') + bookSeries.get('volume', '');
}

function renderSeriesInfo(bookSeries) {
  const volume = bookSeries.get('volume');
  return (
    <span>
      {bookSeries.get('title')}
      {volume && `, ${volume}`}
    </span>
  );
}

function BookSeriesInfoList({ bookSeries }) {
  return (
    <InlineList
      label="Published in"
      items={bookSeries}
      separator={SEPARATOR_AND}
      extractKey={extractSeries}
      renderItem={renderSeriesInfo}
    />
  );
}

BookSeriesInfoList.propTypes = {
  bookSeries: PropTypes.instanceOf(List).isRequired,
};

export default BookSeriesInfoList;
