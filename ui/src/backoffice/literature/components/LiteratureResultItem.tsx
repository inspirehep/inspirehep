import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from 'antd';
import UnclickableTag from '../../../common/components/UnclickableTag';
import Latex from '../../../common/components/Latex';
import LiteratureDocumentTypes from './LiteratureDocumentTypes';
import { BACKOFFICE } from '../../../common/routes';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import {
  resolveDecision,
  filterDecisions,
  isLiteratureUpdateWorkflow,
} from '../../utils/utils';

interface LiteratureResultItemProps {
  item: any;
  isSelectable: boolean;
  isSelected: boolean;
  onSelectionChange?: (workflowId: string, checked: boolean) => void;
}

const LiteratureResultItem = ({
  item,
  isSelectable,
  isSelected,
  onSelectionChange,
}: LiteratureResultItemProps) => {
  const workflowId = item?.get('id');
  const data = item?.get('data');
  const title = data?.getIn(['titles', 0, 'title']);
  const isLiteratureUpdate = isLiteratureUpdateWorkflow(
    item?.get('workflow_type')
  );
  const documentTypes = data?.get('document_type');
  const decisions = item?.get('decisions');
  const filteredDecisions = filterDecisions(decisions);
  const decision = filteredDecisions?.first();
  const resolvedDecision = resolveDecision(decision?.get('action'));

  return (
    <div>
      <div style={{ marginBottom: 4 }} className="workflow-title-with-checkbox">
        {isSelectable && (
          <Checkbox
            checked={isSelected}
            onChange={(event) =>
              onSelectionChange?.(workflowId, event.target.checked)
            }
            aria-label={`Select workflow ${workflowId}`}
          />
        )}
        <div>
          {isLiteratureUpdate && (
            <UnclickableTag color="processing">Update</UnclickableTag>
          )}
          <LiteratureDocumentTypes documentTypes={documentTypes} />
          {resolvedDecision && (
            <UnclickableTag
              className={`decision-pill ${resolvedDecision?.bg}`}
              style={{ marginLeft: isLiteratureUpdate ? 8 : 0 }}
            >
              {resolvedDecision?.text}
            </UnclickableTag>
          )}
        </div>
      </div>
      <div>
        <Link
          className="result-item-title"
          to={`${BACKOFFICE}/${LITERATURE_PID_TYPE}/${workflowId}`}
          target="_blank"
        >
          <Latex>{title}</Latex>
        </Link>
      </div>
    </div>
  );
};

export default LiteratureResultItem;
