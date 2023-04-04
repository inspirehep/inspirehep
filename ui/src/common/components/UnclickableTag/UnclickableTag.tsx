import React, { ComponentPropsWithoutRef } from 'react';
import { Tag } from 'antd';
import classnames from 'classnames';

import './UnclickableTag.less';

interface UnclickableTagProps extends ComponentPropsWithoutRef<any> {
  className?: string;
}

function UnclickableTag({ className, ...otherProps }: UnclickableTagProps) {

    return (
      <Tag
        className={classnames('__UnclickableTag__', className)}
        {...otherProps}
      />
    );
  }

export default UnclickableTag;
