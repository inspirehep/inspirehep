import React from 'react';
import { List } from 'immutable';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function extractSeries(bookSeries: $TSFixMe) {
  return bookSeries.get('title') + bookSeries.get('volume', '');
}

function renderSeriesInfo(bookSeries: $TSFixMe) {
  const volume = bookSeries.get('volume');
  return (
    <span>
      {bookSeries.get('title')}
      {volume && `, ${volume}`}
    </span>
  );
}

type Props = {
    bookSeries: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function BookSeriesInfoList({ bookSeries }: Props) {
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

export default BookSeriesInfoList;
