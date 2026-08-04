import { ErrorListProps } from '@rjsf/utils';
import { Alert } from 'antd';

function ErrorListTemplate({ errors }: ErrorListProps) {
  const numberOfErrors = errors.length;
  return (
    <Alert
      type="error"
      showIcon
      title={`${numberOfErrors} error${numberOfErrors > 1 ? 's' : ''}`}
    />
  );
}

export default ErrorListTemplate;
