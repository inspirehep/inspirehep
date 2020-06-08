import moment from 'moment';
import { List } from 'immutable';

import { SEMINARS } from '../../../common/routes';
import { stripHtml } from '../../../common/utils';

function formatDateTime(datetimeString) {
  const datetime = moment.utc(datetimeString);
  return datetime.format('YYYYMMDDTHHmmssZ').replace('+00:00', 'Z');
}

export default function getIcsFileContent(seminar) {
  const controlNumber = seminar.get('control_number');
  const id = `inspirehep-seminar-${controlNumber}`;
  const location = seminar.getIn(['address', 'place_name']);
  const url = `${window.location.origin}${SEMINARS}/${controlNumber}`;
  const title = seminar.getIn(['title', 'title']);
  const start = formatDateTime(seminar.get('start_datetime'));
  const end = formatDateTime(seminar.get('end_datetime'));
  const description = stripHtml(seminar.getIn(['abstract', 'value'], ''));

  const categories = seminar
    .get('inspire_categories', List())
    .map(category => category.get('term'))
    .join(',');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'PRODID:inspirehep/seminars',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `UID:${id}`,
    `SUMMARY:${title}`,
    `URL:${url}`,
    description && `DESCRIPTION:${description}`,
    categories && `CATEGORIES:${categories}`,
    location && `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\n'); // TODO: handle OS dependent line-break (`\r\n` on windows)
}
