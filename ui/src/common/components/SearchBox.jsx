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
    this.state = {};
  }

  onChange(event) {
    const { value } = event.target;
    this.setState({ draftValue: value });
  }

  render() {
    const { placeholder, onSearch } = this.props;
    const { draftValue } = this.state;
    return (
      <Input.Search
        autoFocus
        style={{ verticalAlign: 'middle' }}
        addonBefore={<SearchScopeSelectContainer />}
        placeholder={placeholder}
        value={draftValue}
        onChange={this.onChange}
        size="large"
        onSearch={onSearch}
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
