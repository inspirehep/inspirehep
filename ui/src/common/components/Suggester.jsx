import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete } from 'antd';
import http from '../http';

class Suggester extends Component {
  constructor(props) {
    super(props);

    this.onSearch = this.onSearch.bind(this);

    this.state = {
      results: [],
    };
  }

  async onSearch(value) {
    if (!value) {
      this.setState({ results: [] });
      return;
    }

    const { pidType, suggesterName } = this.props;
    const urlWithQuery = `/${pidType}/_suggest?${suggesterName}=${value}`;
    try {
      const response = await http.get(urlWithQuery);
      const results = this.responseDataToResults(response.data);
      this.setState({ results });
    } catch (error) {
      this.setState({ results: [] });
    }
  }

  responseDataToResults(responseData) {
    const { suggesterName } = this.props;
    return responseData[suggesterName][0].options;
  }

  render() {
    const { results } = this.state;
    const {
      placeholder,
      renderResultItem,
      suggesterName,
      pidType,
      ...autoCompleteProps
    } = this.props;
    return (
      <AutoComplete
        onSearch={this.onSearch}
        placeholder={placeholder}
        {...autoCompleteProps}
      >
        {results.map(result => (
          <AutoComplete.Option key={result.text}>
            {renderResultItem(result)}
          </AutoComplete.Option>
        ))}
      </AutoComplete>
    );
  }
}

Suggester.propTypes = {
  pidType: PropTypes.string.isRequired,
  suggesterName: PropTypes.string.isRequired,
  renderResultItem: PropTypes.func,
  placeholder: PropTypes.string,
};

Suggester.defaultProps = {
  placeholder: null,
  renderResultItem: resultItem => resultItem.text,
};

export default Suggester;
