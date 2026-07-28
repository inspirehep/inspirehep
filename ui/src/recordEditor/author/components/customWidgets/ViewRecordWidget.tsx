import { WidgetProps } from '@rjsf/utils';

function ViewRecordWidget({ value }: WidgetProps) {
  if (!value) {
    return null;
  }
  const parts = value.split('/');
  let type = parts[parts.length - 2];
  const display = `View ${type.replace(/s$/, '')}`; // de pluralize
  const href = value.replace('/api/', '/');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {display}
    </a>
  );
}

export default ViewRecordWidget;
