import { useCallback, useMemo } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import withFormItem from '../withFormItem';

dayjs.extend(customParseFormat);

const BOTH_TRUE = [true, true];

function DateRangeField({ value = [], ...props }) {
  const { form, name, format } = props;

  const [startDate, endDate] = value;
  const valueAsDayjs = useMemo(
    () => [
      startDate && dayjs(startDate, format),
      endDate && dayjs(endDate, format),
    ],
    [startDate, endDate, format]
  );

  const onChange = useCallback(
    (_, range) => {
      form.setFieldValue(name, range);
    },
    [form, name]
  );

  const onBlur = useCallback(() => {
    form.setFieldTouched(name, true);
  }, [form, name]);

  return (
    <DatePicker.RangePicker
      {...props}
      // set BOTH_TRUE for e2e, it is validate via schema any case.
      allowEmpty={BOTH_TRUE}
      data-test-type="date-range-picker"
      data-testid="date-range-picker"
      data-test-format={format}
      value={valueAsDayjs}
      onBlur={onBlur}
      onChange={onChange}
      className="w-100"
    />
  );
}

export default withFormItem(DateRangeField);
