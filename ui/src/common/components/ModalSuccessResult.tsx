import React from 'react';
import { CheckCircleTwoTone } from '@ant-design/icons';

import styleVariables from '../../styleVariables';

const ModalSuccessResult = ({ children }: { children: any }) => {
  return (
    <div>
      <div className="mb4 tc f-5">
        <CheckCircleTwoTone twoToneColor={styleVariables['@success-color']} />
      </div>
      <div className="tc f5">{children}</div>
    </div>
  );
};

export default ModalSuccessResult;
