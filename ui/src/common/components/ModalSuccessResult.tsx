import React, { Component } from 'react';
import { CheckCircleTwoTone } from '@ant-design/icons';
import PropTypes from 'prop-types';

import styleVariables from '../../styleVariables';

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

ModalSuccessResult.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModalSuccessResult;
