import { WidgetProps } from '@rjsf/utils';
import { Switch, SwitchProps } from 'antd';

function ToggleWidget({ value, name, onChange, id }: WidgetProps) {
  const stylesObject: SwitchProps['styles'] = {
    root: {
      backgroundColor: value ? '#ff4d4f' : '#d1cfcf',
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
      />
    </div>
  );
}

export default ToggleWidget;
