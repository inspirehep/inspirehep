import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function extractChapter(bookChapter) {
  return bookChapter.get('title') + bookChapter.get('volume', '');
}

function renderSeriesInfo(bookChapter) {
  return (
    <span>
      {bookChapter.get('title')} volume:{bookChapter.get('volume')}
    </span>
  );
}

function BookSeriesInfoList({ bookSeries }) {
  return (
    <InlineList
      label="Series of"
      items={bookSeries}
      separator={SEPARATOR_AND}
      extractKey={extractChapter}
      renderItem={renderSeriesInfo}
    />
  );
}

BookSeriesInfoList.propTypes = {
  bookSeries: PropTypes.instanceOf(List).isRequired,
};

export default BookSeriesInfoList;
