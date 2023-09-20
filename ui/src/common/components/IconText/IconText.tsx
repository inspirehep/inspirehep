import React from 'react';
import classNames from 'classnames';

import './IconText.less';

const IconText = ({
  icon,
  text,
  className,
}: {
  icon: JSX.Element;
  text: string | JSX.Element;
  className?: string;
}) => {
  return (
    <span className={classNames('__IconText__', className)}>
      <span className="icon">{icon}</span>
      <span className="v-top">{text}</span>
    </span>
  );
};

export default IconText;
