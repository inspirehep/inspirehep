import { Button } from 'antd';
import { Action, ActionCreator } from 'redux';
import { useEffect, useState } from 'react';

import './Header.less';
import {
  QuestionCircleFilled,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Revision } from '../../types';
import Revisions from './Revisions';
import {
  fetchAuthorRevisionData,
  revertToRevision,
} from '../../../actions/recordEditor';

export interface HeaderProps {
  controlNumber: string;
  onUndo: () => void;
  canUndo: boolean;
  revisions: Revision[];
  revisionError: string | null;
  onSave: () => void;
  resetToLastUpdate: () => void;
  isViewingRevision: boolean;
  dispatch: ActionCreator<Action>;
}

const Header = ({
  controlNumber,
  onUndo,
  canUndo,
  revisions,
  revisionError,
  onSave,
  resetToLastUpdate,
  isViewingRevision,
  dispatch,
}: HeaderProps) => {
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(
    null
  );

  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    if (isReverting && !isViewingRevision) {
      setSelectedRevision(null);
      setIsReverting(false);
    }
  }, [isReverting, isViewingRevision]);

  useEffect(() => {
    if (revisionError) {
      setSelectedRevision(null);
    }
  }, [revisionError]);

  const selectRevision = (revision: Revision) => {
    dispatch(fetchAuthorRevisionData(revision.recUuid, revision.transactionId));
    setSelectedRevision(revision);
  };

  const isUndoDisabled = !canUndo || !!selectedRevision;

  const onGoBackToCurrentFromRevision = () => {
    resetToLastUpdate();
    setSelectedRevision(null);
  };

  const onRevertToSelectedRevision = () => {
    if (selectedRevision) {
      dispatch(revertToRevision(controlNumber, selectedRevision.revisionId));
      setIsReverting(true);
    }
  };

  return (
    <div className="__EditorHeader__">
      <div className="leftContainer">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          className="bg-save"
          onClick={onSave}
          disabled={!!selectedRevision}
        >
          Save
        </Button>
        <Button
          type="text"
          onClick={onUndo}
          disabled={isUndoDisabled}
          icon={
            <UndoOutlined
              style={{
                fontSize: '20px',
                color: 'white',
                opacity: isUndoDisabled ? 0.3 : 1,
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
        <Revisions
          revisions={revisions}
          revisionError={revisionError}
          selectedRevision={selectedRevision}
          selectRevision={selectRevision}
          onGoBackToCurrentFromRevision={onGoBackToCurrentFromRevision}
          onRevertToSelectedRevision={onRevertToSelectedRevision}
        />
      </div>
    </div>
  );
};

export default Header;
