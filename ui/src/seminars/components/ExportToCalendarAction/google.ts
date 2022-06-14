import moment from 'moment';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { stringify } from 'qs';
import { stripHtml, truncateStringWithEllipsis } from '../../../common/utils';
import { getEventTitle } from './common';

const RENDER_URL = 'https://calendar.google.com/calendar/render';

function toGoogleCalendarDate(datetimeString: any) {
  const datetime = moment.utc(datetimeString);
  return datetime.format('YYYYMMDD[T]HHmm[00Z]');
}

function stripHtmlAndTruncate(text: any) {
  const withoutHtml = stripHtml(text);
  // not to have extremely long url.
  return truncateStringWithEllipsis(withoutHtml, 1000);
}

export default function getGoogleCalendarUrl(seminar: any) {
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
