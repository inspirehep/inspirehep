import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface ReorderButtonsProps {
  onMoveUpItem: () => void;
  onMoveDownItem: () => void;
  readonly: boolean;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
}

function ReorderButtons({
  onMoveUpItem,
  onMoveDownItem,
  readonly,
  hasMoveUp,
  hasMoveDown,
}: ReorderButtonsProps) {
  return (
    <>
      <Button
        type="text"
        aria-label="Move up"
        icon={<ArrowUpOutlined />}
        onClick={onMoveUpItem}
        disabled={readonly || !hasMoveUp}
      />
      <Button
        type="text"
        aria-label="Move down"
        icon={<ArrowDownOutlined />}
        onClick={onMoveDownItem}
        disabled={readonly || !hasMoveDown}
      />
    </>
  );
}

export default ReorderButtons;
