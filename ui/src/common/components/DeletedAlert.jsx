import { Alert } from 'antd';

function DeletedAlert() {
  return (
    <div className="mb2">
      <Alert type="error" title="This record is deleted!" showIcon />
    </div>
  );
}

export default DeletedAlert;
