import { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { BaseInputTemplateProps, ariaDescribedByIds } from '@rjsf/utils';
import { Templates } from '@rjsf/antd';
import { Input } from 'antd';

const TEXTAREA_STYLE = {
  width: '100%',
  minWidth: '8rem',
  maxHeight: '100px',
  overflowY: 'auto',
  resize: 'none',
  transition: 'none',
} as const;

const AntdBaseInputTemplate = Templates.BaseInputTemplate!;

function WrappingInputTemplate(props: BaseInputTemplateProps) {
  const {
    id,
    htmlName,
    value,
    type,
    disabled,
    readonly,
    placeholder,
    required,
    options,
    schema,
    registry,
    onChange,
    onBlur,
    onFocus,
  } = props;

  if (
    type === 'number' ||
    type === 'integer' ||
    schema.type === 'number' ||
    schema.type === 'integer'
  ) {
    return <AntdBaseInputTemplate {...props} />;
  }

  const { readonlyAsDisabled = true } = registry.formContext as {
    readonlyAsDisabled?: boolean;
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(
      event.target.value === '' ? options.emptyValue : event.target.value
    );

  return (
    <Input.TextArea
      id={id}
      name={htmlName || id}
      autoSize={{ minRows: 1 }}
      style={TEXTAREA_STYLE}
      value={value ?? ''}
      disabled={disabled || (readonlyAsDisabled && readonly)}
      placeholder={placeholder}
      required={required}
      onChange={!readonly ? handleChange : undefined}
      onBlur={
        !readonly
          ? ({ target }: FocusEvent<HTMLTextAreaElement>) =>
              onBlur(id, target?.value)
          : undefined
      }
      onFocus={
        !readonly
          ? ({ target }: FocusEvent<HTMLTextAreaElement>) =>
              onFocus(id, target?.value)
          : undefined
      }
      onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      }}
      aria-describedby={ariaDescribedByIds(id)}
    />
  );
}

export default WrappingInputTemplate;
