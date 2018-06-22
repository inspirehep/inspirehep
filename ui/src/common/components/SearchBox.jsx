import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class SearchBox extends Component {
  render() {
    return (
      <Input.Search
        style={{ verticalAlign: 'middle' }}
        addonBefore={this.props.searchScopeName}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
        size="large"
        onSearch={this.props.onSearch}
        enterButton
      />
    );
  }
}

SearchBox.propTypes = {
  defaultValue: PropTypes.string,
  searchScopeName: PropTypes.string,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

SearchBox.defaultProps = {
  defaultValue: null,
  placeholder: null,
  onSearch: null,
  searchScopeName: null,
};

export default SearchBox;
