import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/karolinasiemieniuk-morawska/repos/CER... Remove this comment to see the full error message
import styleVariables from '../../../styleVariables';

import './NewFeatureTag.scss';

const GREEN = styleVariables['success-color'];

function NewFeatureTag({
  className
}: any) {
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
