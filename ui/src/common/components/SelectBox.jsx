import { Select } from 'antd';

function SelectBox({ options, virtualScroll = false, ...selectProps }) {
  return (
    <Select
      popupMatchSelectWidth={virtualScroll}
      data-testid="select-box"
      {...selectProps}
      options={options.map((option) => ({
        value: option.value,
        label: (
          <span
            data-testid={
              selectProps['data-testid'] &&
              `${selectProps['data-testid']}-option-${option.value}`
            }
          >
            {option.display || option.value}
          </span>
        ),
      }))}
    />
  );
}

export default SelectBox;
