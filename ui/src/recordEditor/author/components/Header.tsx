import { Button } from 'antd';
import './Header.less';
import {
  MergeOutlined,
  QuestionCircleFilled,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface HeaderProps {
  lastRevision?: { date: string; userEmail: string };
  onSave: () => void;
}

const Header = ({ lastRevision, onSave }: HeaderProps) => {
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
          icon={<UndoOutlined style={{ fontSize: '20px', color: 'white' }} />}
        />
        <Button
          type="text"
          icon={<MergeOutlined style={{ fontSize: '20px', color: 'white' }} />}
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
