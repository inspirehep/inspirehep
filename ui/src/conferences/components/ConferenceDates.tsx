import dayjs from 'dayjs';

import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

function getDisplayFormatForDateString(date: any) {
  if (hasDayMonthAndYear(date)) {
    return 'D MMMM YYYY';
  }

  if (hasMonthAndYear(date)) {
    return 'MMMM YYYY';
  }

  return 'YYYY';
}

function ConferenceDates({
  openingDate,
  closingDate,
}: {
  openingDate: string;
  closingDate?: string;
}) {
  if (!openingDate) {
    return null;
  }

  const displayFormat = getDisplayFormatForDateString(openingDate);
  const openingDayjs = dayjs(openingDate);
  if (!closingDate) {
    return <>{openingDayjs.format(displayFormat)}</>;
  }

  const closingDayjs = dayjs(closingDate);

  if (openingDayjs.isSame(closingDayjs)) {
    return <>{openingDayjs.format(displayFormat)}</>;
  }

  if (openingDayjs.isSame(closingDayjs, 'month')) {
    if (hasDayMonthAndYear(openingDate)) {
      return (
        <>{`${openingDayjs.format('D')}-${closingDayjs.format(
          displayFormat
        )}`}</>
      );
    }
    return <>{openingDayjs.format(displayFormat)}</>;
  }

  if (openingDayjs.isSame(closingDayjs, 'year')) {
    if (hasDayMonthAndYear(openingDate)) {
      return (
        <>{`${openingDayjs.format('D MMMM')}-${closingDayjs.format(
          displayFormat
        )}`}</>
      );
    }

    if (hasMonthAndYear(openingDate)) {
      return (
        <>{`${openingDayjs.format('MMMM')}-${closingDayjs.format(
          displayFormat
        )}`}</>
      );
    }
    return <>{openingDayjs.format(displayFormat)}</>;
  }

  return (
    <>{`${openingDayjs.format(displayFormat)}-${closingDayjs.format(
      displayFormat
    )}`}</>
  );
}

export default ConferenceDates;
