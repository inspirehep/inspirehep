import React from 'react';
import { WorkflowTypes } from '../../constants';
import UnclickableTag from '../../../common/components/UnclickableTag';
import Latex from '../../../common/components/Latex';

const LiteratureResultItem = ({ item }: { item: any }) => {
  const data = item?.get('data');
  const title = data?.getIn(['titles', 0, 'title']);
  const isLiteratureUpdate =
    item?.get('workflow_type') === WorkflowTypes.HEP_UPDATE;

  return (
    <div className="flex items-center">
      {isLiteratureUpdate && (
        <>
          {' '}
          <UnclickableTag color="processing">Update</UnclickableTag>
        </>
      )}
      <span className="dib ml2">
        <Latex>{title}</Latex>
      </span>
    </div>
  );
};

export default LiteratureResultItem;
