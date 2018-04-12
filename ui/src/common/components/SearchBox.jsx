import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class SearchBox extends Component {
  render() {
    return (
      <div>
        <Input.Search
          placeholder={this.props.placeholder}
          onSearch={this.props.onSearch}
          enterButton
        />
      </div>
    );
  }
}

SearchBox.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

SearchBox.defaultProps = {
  placeholder: '',
  onSearch: null,
};

export default SearchBox;
