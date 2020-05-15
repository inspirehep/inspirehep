import React from 'react';
import { Tag } from 'antd';
import styleVariables from '../../../styleVariables';

import './NewFeatureTag.scss';

const GREEN = styleVariables['success-color'];

function NewFeatureTag() {
  return (
    <Tag className="__NewFeatureTag__" color={GREEN}>
      New
    </Tag>
  );
}

export default NewFeatureTag;
