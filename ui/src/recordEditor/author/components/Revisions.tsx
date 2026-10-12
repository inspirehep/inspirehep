import dayjs from 'dayjs';
import { Button, Dropdown } from 'antd';

import { Revision } from '../../types';

interface RevisionsProps {
  revisions: Revision[];
  revisionError: string | null;
  selectedRevision: Revision | null;
  selectRevision: (revision: Revision) => void;
  onGoBackToCurrentFromRevision: () => void;
  onRevertToSelectedRevision: () => void;
}

function Revisions({
  revisions,
  revisionError,
  selectedRevision,
  selectRevision,
  onGoBackToCurrentFromRevision,
  onRevertToSelectedRevision,
}: RevisionsProps) {
  if (revisionError) {
    return <div className="white">{revisionError}</div>;
  }

  const [lastRevision, ...olderRevisions] = revisions;
  const revisionItems = olderRevisions.map((revision) => ({
    key: revision.revisionId,
    label: (
      <Button type="link" onClick={() => selectRevision(revision)}>
        On {dayjs(revision.updated).format('MMM D, YYYY, h:mm:ss A')} by{' '}
        {revision.userEmail}
      </Button>
    ),
  }));

  if (selectedRevision) {
    return (
      <span className="white">
        <Button
          size="small"
          type="primary"
          onClick={onRevertToSelectedRevision}
        >
          Revert to
        </Button>{' '}
        {dayjs(selectedRevision.updated).format('MMM D, YYYY, h:mm:ss A')} by{' '}
        {selectedRevision.userEmail}{' '}
        <Button
          variant="link"
          color="cyan"
          className="pa0"
          onClick={onGoBackToCurrentFromRevision}
        >
          or go back to current
        </Button>
      </span>
    );
  }

  return (
    lastRevision && (
      <Dropdown menu={{ items: revisionItems }}>
        <Button className="__LinkLikeButton__ white" type="text">
          Last edit on{' '}
          {dayjs(lastRevision.updated).format('MMM D, YYYY, h:mm:ss A')} by{' '}
          {lastRevision.userEmail}
        </Button>
      </Dropdown>
    )
  );
}

export default Revisions;
