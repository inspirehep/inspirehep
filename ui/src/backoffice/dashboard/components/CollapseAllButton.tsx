import { Button } from 'antd';
import { CollapseState } from '../../constants';

interface CollapseAllButtonProps {
  collapseState: CollapseState;
  onCollapseAll: (isExpanding: boolean) => void;
}

const CollapseAllButton = ({
  collapseState,
  onCollapseAll,
}: CollapseAllButtonProps) => {
  const label =
    collapseState === CollapseState.ALL_COLLAPSED
      ? 'Expand all'
      : 'Collapse all';

  const handleClick = () => {
    onCollapseAll(collapseState === CollapseState.ALL_COLLAPSED);
  };

  return <Button onClick={handleClick}>{label}</Button>;
};

export default CollapseAllButton;
