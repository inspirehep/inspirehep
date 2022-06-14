import React from 'react';
import { Tag } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/nooraangelva/Codes/inspirehep/ui/src/... Remove this comment to see the full error message
import styleVariables from '../../../styleVariables';

import './NewFeatureTag.scss';

const GREEN = styleVariables['success-color'];

type Props = {
    className?: string;
};

function NewFeatureTag({ className }: Props) {
  return (
    <Tag className={classnames('__NewFeatureTag__', className)} color={GREEN}>
      New
    </Tag>
  );
}

export default NewFeatureTag;
