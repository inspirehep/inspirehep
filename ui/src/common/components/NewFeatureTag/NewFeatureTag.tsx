import React from 'react';
import { Tag } from 'antd';
import classnames from 'classnames';

import styleVariables from '../../../styleVariables';

import './NewFeatureTag.less';

const GREEN = styleVariables['@success-color'];

function NewFeatureTag({ className }: { className?: string }) {
  return (
    <Tag className={classnames('__NewFeatureTag__', className)} color={GREEN}>
      New
    </Tag>
  );
}

export default NewFeatureTag;
