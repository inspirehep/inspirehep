import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { ErrorListProps } from '@rjsf/utils';
import { Alert, Button } from 'antd';
import { useState } from 'react';

const ID_PREFIX = 'root';
const ID_SEPARATOR = '_';

function ErrorListTemplate({ errors }: ErrorListProps) {
  const [isExtended, setIsExtended] = useState(false);
  const errorsToBeDisplayed = errors.filter((error) => error.name !== 'if');
  const numberOfErrors = errorsToBeDisplayed.length;

  const convertErrorPropertyToField = (property: string) => {
    const path = property.split(/[.[\]]/).filter(Boolean);
    const id = [ID_PREFIX, ...path].join(ID_SEPARATOR);
    const field =
      document.getElementById(id) ??
      document.getElementById([id, '0'].join(ID_SEPARATOR));
    return field;
  };

  function focusField(property: string) {
    const field = convertErrorPropertyToField(property);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus({ preventScroll: true });
    }
  }

  return (
    <Alert
      className="record-editor-error-list"
      type="error"
      showIcon
      title={`${numberOfErrors} error${numberOfErrors > 1 ? 's' : ''}`}
      action={
        <Button
          icon={isExtended ? <UpOutlined /> : <DownOutlined />}
          type="link"
          onClick={() => setIsExtended(!isExtended)}
        >
          Details
        </Button>
      }
      description={
        isExtended ? (
          <ul>
            {errorsToBeDisplayed.map((error, index) => (
              // eslint-disable-next-line react/no-array-index-key -- no change in the list
              <li key={index}>
                <Button type="link" onClick={() => focusField(error.property!)}>
                  {error.property}
                </Button>
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  );
}

export default ErrorListTemplate;
