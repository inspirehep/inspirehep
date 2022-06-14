import React, { Component } from 'react';
import { CheckCircleTwoTone } from '@ant-design/icons';

// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/nooraangelva/Codes/inspirehep/ui/src/... Remove this comment to see the full error message
import styleVariables from '../../styleVariables';

type Props = {};

// TODO: evaluate if we can use `antd.Result type=success` instead
class ModalSuccessResult extends Component<Props> {

  render() {
    const { children } = this.props;
    return (
      <div>
        <div className="mb4 tc f-5">
          <CheckCircleTwoTone twoToneColor={styleVariables['success-color']} />
        </div>
        <div className="tc f5">{children}</div>
      </div>
    );
  }
}

export default ModalSuccessResult;
