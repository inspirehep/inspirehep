import { WidgetProps } from '@rjsf/utils';
import { Switch, SwitchProps } from 'antd';

function ToggleWidget({ value, name, onChange, id }: WidgetProps) {
  const stylesObject: SwitchProps['styles'] = {
    root: {
      backgroundColor: '#e74c3c',
      opacity: value ? 1 : 0.5,
    },
  };
  return (
    <div className="pa2 w-100 flex justify-end">
      <Switch
        id={id}
        checked={!!value}
        onChange={(checked) => onChange(checked)}
        checkedChildren={name}
        unCheckedChildren={`not ${name}`}
        size="medium"
        styles={stylesObject}
      />
    </div>
  );
}

export default ToggleWidget;
