import React from 'react';
import moment from 'moment';
import { InlineUL } from '../../common/components/InlineList';
import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

function getDisplayFormatForDateString(date: $TSFixMe) {
  if (hasDayMonthAndYear(date)) {
    return 'MMM D, YYYY';
  }

  if (hasMonthAndYear(date)) {
    return 'MMM, YYYY';
  }

  return 'YYYY';
}

function getFormattedDate(date: $TSFixMe) {
  return moment(date).format(getDisplayFormatForDateString(date));
}

type Props = {
    dateStarted?: string;
    dateProposed?: string;
    dateApproved?: string;
    dateCompleted?: string;
    dateCancelled?: string;
    wrapperClassName?: string;
};

function ExperimentDates({ dateStarted, dateProposed, dateApproved, dateCompleted, dateCancelled, wrapperClassName, }: Props) {
  return (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <InlineUL wrapperClassName={wrapperClassName}>
      {dateProposed && <span>Proposed: {getFormattedDate(dateProposed)}</span>}
      {dateApproved && <span>Approved: {getFormattedDate(dateApproved)}</span>}
      {dateStarted && <span>Started: {getFormattedDate(dateStarted)}</span>}
      {dateCancelled && (
        <span>Cancelled: {getFormattedDate(dateCancelled)}</span>
      )}
      {dateCompleted && (
        <span>Completed: {getFormattedDate(dateCompleted)}</span>
      )}
      {!dateCancelled && !dateCompleted && <span>Still Running</span>}
    </InlineUL>
  );
}

export default ExperimentDates;
