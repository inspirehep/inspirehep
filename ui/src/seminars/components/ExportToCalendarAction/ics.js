import moment from 'moment';
import { createEvent } from 'ics';
import { List } from 'immutable';

import { SEMINARS } from '../../../common/routes';
import { stripHtml } from '../../../common/utils';

function toDateTimeArray(datetimeString) {
  const datetime = moment.utc(datetimeString);
  return [
    datetime.year(),
    datetime.month() + 1, // moment months are 0 indexed
    datetime.date(),
    datetime.hour(),
    datetime.minutes(),
  ];
}

export default function getIcsFileContent(seminar) {
  const categories = seminar
    .get('inspire_categories', List())
    .map(category => category.get('term'))
    .toArray();
  const start = toDateTimeArray(seminar.get('start_datetime'));
  const end = toDateTimeArray(seminar.get('end_datetime'));
  const controlNumber = seminar.get('control_number');
  const description = stripHtml(seminar.getIn(['abstract', 'value'], ''));

  const event = {
    productId: 'inspirehep/seminars',
    uid: `inspirehep-seminar-${controlNumber}`,
    start,
    end,
    title: seminar.getIn(['title', 'title']),
    description,
    location: seminar.getIn(['address', 'place_name']),
    url: `${window.location.origin}${SEMINARS}/${controlNumber}`,
    categories: categories.length > 0 ? categories : undefined,
  };
  const { value, error } = createEvent(event);

  if (error) {
    throw error;
  }

  return value;
}
