import { Button } from 'antd';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { useEffect, useState } from 'react';

import './Header.less';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { Revision } from '../types';
import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import Revisions from './Revisions';
import {
  fetchRecordRevisionData,
  revertToRevision,
} from '../../actions/editor/record';
import Help from './Help';
import TicketsContainer from './Tickets';

type HeaderWithRevisionProps = {
  revisions: Revision[];
  revisionError: string | null;
  resetToLastUpdate: () => void;
  isViewingRevision: boolean;
};

export type HeaderProps = {
  controlNumber: string;
  type: string;
  onUndo: () => void;
  canUndo: boolean;
  onSave: () => void;
  dispatch: ThunkDispatch<RootState, HttpClientWrapper, Action>;
  withRevisions: false | HeaderWithRevisionProps;
};

const Header = ({
  controlNumber,
  type,
  onUndo,
  canUndo,
  onSave,
  dispatch,
  withRevisions,
}: HeaderProps) => {
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(
    null
  );

  const [isReverting, setIsReverting] = useState(false);

  const isViewingRevision = withRevisions
    ? withRevisions.isViewingRevision
    : false;
  const revisionError = withRevisions ? withRevisions.revisionError : null;

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
    dispatch(fetchRecordRevisionData(revision.recUuid, revision.transactionId));
    setSelectedRevision(revision);
  };

  const isUndoDisabled = !canUndo || !!selectedRevision;

  const onGoBackToCurrentFromRevision = () => {
    if (withRevisions) {
      withRevisions.resetToLastUpdate();
      setSelectedRevision(null);
    }
  };

  const onRevertToSelectedRevision = () => {
    if (selectedRevision) {
      dispatch(
        revertToRevision(type, controlNumber, selectedRevision.revisionId)
      );
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
        {withRevisions && (
          <Revisions
            revisions={withRevisions.revisions}
            revisionError={withRevisions.revisionError}
            selectedRevision={selectedRevision}
            selectRevision={selectRevision}
            onGoBackToCurrentFromRevision={onGoBackToCurrentFromRevision}
            onRevertToSelectedRevision={onRevertToSelectedRevision}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
