import React from 'react';
import { WorkflowTypes } from '../../constants';
import UnclickableTag from '../../../common/components/UnclickableTag';
import Latex from '../../../common/components/Latex';
import { resolveDecision, filterDecisions } from '../../utils/utils';

const LiteratureResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');
  const title = data?.getIn(['titles', 0, 'title']);
  const isLiteratureUpdate =
    item?.get('workflow_type') === WorkflowTypes.HEP_UPDATE;
  const decisions = item?.get('decisions');
  const filteredDecisions = filterDecisions(decisions);
  const decision = filteredDecisions?.first();
  const resolvedDecision = resolveDecision(decision?.get('action'));

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        {isLiteratureUpdate && (
          <UnclickableTag color="processing">Update</UnclickableTag>
        )}
        {resolvedDecision && (
          <UnclickableTag
            className={`decision-pill ${resolvedDecision?.bg}`}
            style={{ marginLeft: isLiteratureUpdate ? 8 : 0 }}
          >
            {resolvedDecision?.text}
          </UnclickableTag>
        )}
      </div>
      <div>
        <Latex>{title}</Latex>
      </div>
    </div>
  );
};

export default LiteratureResultItem;
