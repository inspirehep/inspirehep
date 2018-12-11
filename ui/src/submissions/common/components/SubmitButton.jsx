import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

class SubmitButton extends Component {
  render() {
    const { isSubmitting, isValid, isValidating } = this.props;

    return (
      <Button
        type="primary"
        htmlType="submit"
        loading={isSubmitting || isValidating}
        disabled={!isValid}
      >
        Submit
      </Button>
    );
  }
}

SubmitButton.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValidating: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
};

export default SubmitButton;
