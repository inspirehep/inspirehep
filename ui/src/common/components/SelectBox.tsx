import React from 'react';
import { Select } from 'antd';
import { SelectOptionsPropType } from '../propTypes';

type Props = {
    options: SelectOptionsPropType;
    virtualScroll?: boolean;
};

function SelectBox({ options, virtualScroll = false, ...selectProps }: Props) {
  return (
    <Select dropdownMatchSelectWidth={virtualScroll} showArrow {...selectProps}>
      {options.map(option => (
        <Select.Option key={option.value} value={option.value}>
          <span
            data-test-id={
              // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              selectProps['data-test-id'] &&
              `${              
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
selectProps['data-test-id']}-option-${option.value}`
            }
          >
            {option.display || option.value}
          </span>
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectBox;
