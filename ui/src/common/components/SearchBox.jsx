import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class SearchBox extends Component {
  render() {
    return (
      <div>
        <Input.Search
          placeholder={this.props.placeholder}
          defaultValue={this.props.defaultValue}
          onSearch={this.props.onSearch}
          enterButton
        />
      </div>
    );
  }
}

SearchBox.propTypes = {
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

SearchBox.defaultProps = {
  defaultValue: null,
  placeholder: null,
  onSearch: null,
};

export default SearchBox;
