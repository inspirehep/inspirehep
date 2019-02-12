import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

class CheckboxItem extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    // TODO: maybe move to deriveStateFromProps?
    const { checked } = this.props;
    this.state = {
      checked,
    };
  }

  onChange(event) {
    const { checked } = event.target;
    const { onChange } = this.props;
    this.setState({ checked });

    if (onChange) {
      onChange(checked);
    }
  }

  render() {
    const { checked } = this.state;
    const { children } = this.props;
    return (
      <Checkbox onChange={this.onChange} checked={checked}>
        {children}
      </Checkbox>
    );
  }
}

CheckboxItem.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,
};

CheckboxItem.defaultProps = {
  checked: false,
  onChange: null,
};

export default CheckboxItem;
