import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { InlineUL } from '../../common/components/InlineList';
import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

function getDisplayFormatForDateString(date: any) {
  if (hasDayMonthAndYear(date)) {
    return 'MMM D, YYYY';
  }

  if (hasMonthAndYear(date)) {
    return 'MMM, YYYY';
  }

  return 'YYYY';
}

function getFormattedDate(date: any) {
  return moment(date).format(getDisplayFormatForDateString(date));
}

function ExperimentDates({
  dateStarted,
  dateProposed,
  dateApproved,
  dateCompleted,
  dateCancelled,
  wrapperClassName
}: any) {
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

ExperimentDates.propTypes = {
  dateStarted: PropTypes.string,
  dateProposed: PropTypes.string,
  dateApproved: PropTypes.string,
  dateCompleted: PropTypes.string,
  dateCancelled: PropTypes.string,
  wrapperClassName: PropTypes.string,
};

export default ExperimentDates;
