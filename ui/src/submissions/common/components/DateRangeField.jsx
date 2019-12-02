import React, { useCallback, useMemo } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

import withFormItem from '../withFormItem';

function DateRangeField({ value = [], ...props }) {
  const { form, name } = props;

  const [startDate, endDate] = value;
  const valueAsMoment = useMemo(
    () => [startDate && moment(startDate), endDate && moment(endDate)],
    [startDate, endDate]
  );

  const onChange = useCallback(
    (_, range) => {
      form.setFieldValue(name, range);
    },
    [form, name]
  );

  const onBlur = useCallback(
    () => {
      form.setFieldTouched(name, true);
    },
    [form, name]
  );

  return (
    <DatePicker.RangePicker
      {...props}
      value={valueAsMoment}
      onBlur={onBlur}
      onChange={onChange}
      className="w-100"
    />
  );
}

export default withFormItem(DateRangeField);
