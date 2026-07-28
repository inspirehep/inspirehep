import { Button, Input } from 'antd';
import './Header.less';
import {
  MergeOutlined,
  QuestionCircleFilled,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Search } = Input;

interface HeaderProps {
  recordId: string;
  lastRevision?: { date: string; userEmail: string };
  onSave: () => void;
}

const Header = ({ recordId, lastRevision, onSave }: HeaderProps) => {
  const lastRevisionDate = lastRevision
    ? moment(lastRevision.date).format('MMM D, YYYY, h:mm:ss A')
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
      <Search
        placeholder="Search records"
        style={{ width: 332 }}
        defaultValue={recordId}
      />

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
