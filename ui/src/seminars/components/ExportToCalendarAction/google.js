import moment from 'moment';
import { stringify } from 'qs';
import { stripHtml } from '../../../common/utils';

const RENDER_URL = 'https://calendar.google.com/calendar/render';

function toGoogleCalendarDate(datetimeString) {
  const datetime = moment.utc(datetimeString);
  return datetime.format('YYYYMMDD[T]HHmm[00Z]');
}

export default function getGoogleCalendarUrl(seminar) {
  const text = seminar.getIn(['title', 'title']);
  const details = stripHtml(seminar.getIn(['abstract', 'value'], ''));
  const location = seminar.getIn(['address', 'place_name']);

  const start = seminar.get('start_datetime');
  const end = seminar.get('end_datetime');

  const dates = `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`;

  const event = {
    text,
    details,
    location,
    dates,
  };

  return `${RENDER_URL}?action=TEMPLATE&${stringify(event)}`;
}
