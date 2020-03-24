import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import SearchScopeSelectContainer from '../containers/SearchScopeSelectContainer';

class SearchBox extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { value } = nextProps;
    const { previousValue } = prevState;
    if (value !== previousValue) {
      return {
        ...prevState,
        previousValue: value,
        draftValue: value,
      };
    }
    return prevState;
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.state = {};
  }

  onChange(event) {
    const { value } = event.target;
    this.setState({ draftValue: value });
  }

  onSearch(value) {
    const { onSearch, namespace } = this.props;
    onSearch(namespace, value);
  }

  render() {
    const { placeholder } = this.props;
    const { draftValue } = this.state;
    return (
      <Input.Search
        autoFocus
        data-test-id="search-box-input"
        style={{ verticalAlign: 'middle' }}
        addonBefore={<SearchScopeSelectContainer />}
        placeholder={placeholder}
        value={draftValue}
        onChange={this.onChange}
        size="large"
        onSearch={this.onSearch}
        enterButton
      />
    );
  }
}

SearchBox.propTypes = {
  namespace: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
};

SearchBox.defaultProps = {
  value: null,
  placeholder: null,
};

export default SearchBox;
