import moment from 'moment';
import { stringify } from 'qs';
import { stripHtml, truncateStringWithEllipsis } from '../../../common/utils';
import { getEventTitle } from './common';

const RENDER_URL = 'https://calendar.google.com/calendar/render';

function toGoogleCalendarDate(datetimeString) {
  const datetime = moment.utc(datetimeString);
  return datetime.format('YYYYMMDD[T]HHmm[00Z]');
}

function stripHtmlAndTruncate(text) {
  const withoutHtml = stripHtml(text);
  // not to have extremely long url.
  return truncateStringWithEllipsis(withoutHtml, 1000);
}

export default function getGoogleCalendarUrl(seminar) {
  const text = getEventTitle(seminar);
  const details = stripHtmlAndTruncate(
    seminar.getIn(['abstract', 'value'], '')
  );
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
