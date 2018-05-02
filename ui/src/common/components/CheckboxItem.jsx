import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

class CheckboxItem extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    // TODO: maybe move to deriveStateFromProps?
    this.state = {
      checked: this.props.checked,
    };
  }

  onChange(event) {
    const { checked } = event.target;
    this.setState({ checked });

    if (this.props.onChange) {
      this.props.onChange(checked);
    }
  }

  render() {
    return (
      <Checkbox
        onChange={this.onChange}
        checked={this.state.checked}
      >
        {this.props.children}
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
