import PropTypes from 'prop-types';
import moment from 'moment';


function hasMonthAndYear(date) {
  return date.length >= 6;
}

function hasDayMonthAndYear(date) {
  return date.length >= 8;
}

function getDisplayFormatForDateString(date) {
  if (hasDayMonthAndYear(date)) {
    return 'D MMMM YYYY';
  }

  if (hasMonthAndYear(date)) {
    return 'MMMM YYYY';
  }

  return 'YYYY';
}

function ConferenceDates({ openingDate, closingDate }) {
  if (!openingDate) {
    return null;
  }

  const displayFormat = getDisplayFormatForDateString(openingDate);
  const openingMoment = moment(openingDate)
  if (!closingDate) {
    return openingMoment.format(displayFormat);
  }

  const closingMoment = moment(closingDate);

  if (openingMoment.isSame(closingMoment)) {
    return openingMoment.format(displayFormat);
  }

  if (openingMoment.isSame(closingMoment, 'month')) {
    if (hasDayMonthAndYear(openingDate)) {
      return `${openingMoment.format('D')}-${closingMoment.format(displayFormat)}`
    }
    return openingMoment.format(displayFormat);
  }

  if (openingMoment.isSame(closingMoment, 'year')) {
    if (hasDayMonthAndYear(openingDate)) {
      return `${openingMoment.format('D MMMM')}-${closingMoment.format(displayFormat)}`
    }

    if (hasMonthAndYear(openingDate)) {
      return `${openingMoment.format('MMMM')}-${closingMoment.format(displayFormat)}`
    }
    return openingMoment.format(displayFormat);
  }

  return `${openingMoment.format(displayFormat)}-${closingMoment.format(displayFormat)}`
}

ConferenceDates.propTypes = {
  openingDate: PropTypes.string.isRequired,
  closingDate: PropTypes.string,
};

export default ConferenceDates;
