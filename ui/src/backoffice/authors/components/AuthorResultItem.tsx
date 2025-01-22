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

  return (
    <div className="flex">
      <div style={{ marginTop: '-2px' }}>
        <UnclickableTag>Author</UnclickableTag>
        {isAuthorUpdate && (
          <>
            {' '}
            <UnclickableTag color="processing">Update</UnclickableTag>
          </>
        )}
        {decision && (
          <UnclickableTag
            className={`decision-pill ${
              resolveDecision(decision?.get('action'))?.bg
            }`}
          >
            {resolveDecision(decision?.get('action'))?.text}
          </UnclickableTag>
        )}
      </div>
      <span className="dib ml2">{authorName}</span>
    </div>
  );
};

export default AuthorResultItem;
