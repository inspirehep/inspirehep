import React, { MouseEventHandler } from 'react';

import './SecondaryButton.less';

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: any;
}) {
  return (
    <button type="button" className="__SecondaryButton__" onClick={onClick}>
      {children}
    </button>
  );
}

export default SecondaryButton;
