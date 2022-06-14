import React, { Component } from 'react';
import { CheckCircleTwoTone } from '@ant-design/icons';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2306) FIXME: File '/Users/karolinasiemieniuk-morawska/repos/CER... Remove this comment to see the full error message
import styleVariables from '../../styleVariables.ts';

// TODO: evaluate if we can use `antd.Result type=success` instead
class ModalSuccessResult extends Component {
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ModalSuccessResult.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModalSuccessResult;
