import { Button } from 'antd';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { useEffect, useState } from 'react';

import './Header.less';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { Revision } from '../../types';
import { RootState } from '../../../types';
import { HttpClientWrapper } from '../../../common/http';
import Revisions from './Revisions';
import {
  fetchAuthorRevisionData,
  revertToRevision,
} from '../../../actions/recordEditor';
import Help from './Help';
import TicketsContainer from './Tickets';

export interface HeaderProps {
  controlNumber: string;
  onUndo: () => void;
  canUndo: boolean;
  revisions: Revision[];
  revisionError: string | null;
  onSave: () => void;
  resetToLastUpdate: () => void;
  isViewingRevision: boolean;
  dispatch: ThunkDispatch<RootState, HttpClientWrapper, Action>;
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
        <Help />
      </div>

      <div className="rightContainer">
        <TicketsContainer
          controlNumber={controlNumber}
          dispatchAction={dispatch}
        />
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
