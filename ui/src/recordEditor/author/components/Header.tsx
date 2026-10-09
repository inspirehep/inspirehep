import { Button } from 'antd';
import './Header.less';
import {
  QuestionCircleFilled,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface HeaderProps {
  lastRevision?: { date: string; userEmail: string };
  onSave: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const Header = ({ lastRevision, onSave, onUndo, canUndo }: HeaderProps) => {
  const lastRevisionDate = lastRevision
    ? dayjs(lastRevision.date).format('MMM D, YYYY, h:mm:ss A')
    : '';

  return (
    <div className="__EditorHeader__">
      <div className="leftContainer">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          className="bg-save"
          onClick={onSave}
        >
          Save
        </Button>
        <Button
          type="text"
          onClick={onUndo}
          disabled={!canUndo}
          icon={
            <UndoOutlined
              style={{
                fontSize: '20px',
                color: 'white',
                opacity: canUndo ? 1 : 0.3,
              }}
            />
          }
        />
        <Button
          type="text"
          icon={
            <QuestionCircleFilled
              style={{ fontSize: '20px', color: 'white' }}
            />
          }
        />
      </div>

      <div className="rightContainer">
        <Button type="primary" className="bg-ticket">
          New Ticket
        </Button>
        {lastRevision && (
          <span style={{ color: 'white' }}>
            Last edit on {lastRevisionDate} by {lastRevision.userEmail}
          </span>
        )}
      </div>
    </div>
  );
};

export default Header;
