import React from 'react';
import classnames from 'classnames';

import './InlineList.less';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

const InlineUL = ({
  children,
  separator,
  wrapperClassName,
}: {
  children: any;
  separator: string;
  wrapperClassName: string;
}) => {
  return (
    <div className={classnames('__InlineList__', wrapperClassName)}>
      <ul>
        {React.Children.toArray(children).map(
          (child, index, array) =>
            child && (
              // @ts-ignore
              <li key={child.key}>
                {child}
                {index < array.length - 1 && separator}
              </li>
            )
        )}
      </ul>
    </div>
  );
};

InlineUL.defaultProps = {
  separator: DEFAULT_SEPARATOR_TYPE,
  wrapperClassName: null,
};

export default InlineUL;
