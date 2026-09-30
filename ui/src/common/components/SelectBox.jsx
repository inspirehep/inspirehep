import { Select } from 'antd';

function SelectBox({ options, virtualScroll = false, ...selectProps }) {
  return (
    <Select
      popupMatchSelectWidth={virtualScroll}
      data-testid="select-box"
      {...selectProps}
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          <span
            data-testid={
              selectProps['data-testid'] &&
              `${selectProps['data-testid']}-option-${option.value}`
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
