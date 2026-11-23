import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useArrayAddItem } from '../../../ArrayAddItemContext';

interface AddElementHereButtonProps {
  index: number;
  readonly?: boolean;
}

function AddElementHereButton({ index, readonly }: AddElementHereButtonProps) {
  const arrayAddItem = useArrayAddItem();
  const addAt = arrayAddItem?.addAt;
  if (!addAt) {
    return null;
  }
  return (
    <Button
      type="link"
      icon={<PlusOutlined />}
      onClick={() => addAt(index)}
      disabled={readonly || arrayAddItem?.addAtDisabled}
    >
      Add new element here
    </Button>
  );
}

export default AddElementHereButton;
