import { WidgetProps } from '@rjsf/utils';
import { Switch, SwitchProps } from 'antd';

function ToggleWidget({
  value,
  name,
  onChange,
  id,
  readonly,
  uiSchema,
}: WidgetProps) {
  const color = uiSchema?.['ui:options']?.color ?? '#d1cfcf';

  const stylesObject: SwitchProps['styles'] = {
    root: {
      backgroundColor: value ? color : '#d1cfcf',
    },
  };

  return (
    <div className="pa2 w-100 flex justify-end">
      <Switch
        id={id}
        checked={!!value}
        onChange={(checked) => onChange(checked)}
        checkedChildren={name}
        unCheckedChildren={name}
        size="medium"
        styles={stylesObject}
        disabled={readonly}
      />
    </div>
  );
}

export default ToggleWidget;
