import React from 'react';
import { WorkflowTypes } from '../../constants';
import UnclickableTag from '../../../common/components/UnclickableTag';
import { resolveDecision } from '../../utils/utils';

const AuthorResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');
  const decision = item?.get('decisions')?.first();
  const authorName = data?.getIn(['name', 'value']);
  const isAuthorUpdate =
    item?.get('workflow_type') === WorkflowTypes.AUTHOR_UPDATE;
  const resolvedDecision = resolveDecision(decision?.get('action'));

  return (
    <div className="flex items-center">
      {isAuthorUpdate && (
        <UnclickableTag color="processing">Update</UnclickableTag>
      )}
      {resolvedDecision && (
        <UnclickableTag className={`decision-pill ${resolvedDecision?.bg}`}>
          {resolvedDecision?.text}
        </UnclickableTag>
      )}
      <span className="dib ml2">{authorName}</span>
    </div>
  );
};

export default AuthorResultItem;
