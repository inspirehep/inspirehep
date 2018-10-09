import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import SearchScopeSelectContainer from '../containers/SearchScopeSelectContainer';

class SearchBox extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { value } = nextProps;
    return {
      ...prevState,
      value,
    };
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {};
  }

  onChange(event) {
    const { value } = event.target;
    this.setState({ value });
  }

  render() {
    return (
      <Input.Search
        style={{ verticalAlign: 'middle' }}
        addonBefore={<SearchScopeSelectContainer />}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onChange={this.onChange}
        size="large"
        onSearch={this.props.onSearch}
        enterButton
      />
    );
  }
}

SearchBox.propTypes = {
  value: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

SearchBox.defaultProps = {
  value: null,
  placeholder: null,
  onSearch: null,
};

export default SearchBox;
