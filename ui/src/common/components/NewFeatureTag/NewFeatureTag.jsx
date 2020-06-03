import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styleVariables from '../../../styleVariables';

import './NewFeatureTag.scss';

const GREEN = styleVariables['success-color'];

function NewFeatureTag({ className }) {
  return (
    <Tag className={classnames('__NewFeatureTag__', className)} color={GREEN}>
      New
    </Tag>
  );
}

NewFeatureTag.propTypes = {
  className: PropTypes.string,
};

export default NewFeatureTag;
