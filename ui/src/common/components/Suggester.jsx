import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete } from 'antd';
import debounce from 'lodash.debounce';

import http from '../http';

export const REQUEST_DEBOUNCE_MS = 250;

class Suggester extends Component {
  constructor(props) {
    super(props);

    this.onSearch = debounce(this.onSearch.bind(this), REQUEST_DEBOUNCE_MS);
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

  renderSuggestions() {
    const { results } = this.state;
    const { renderResultItem, extractItemCompletionValue } = this.props;
    return results.map(result => {
      const completionValue = extractItemCompletionValue(result);
      return (
        <AutoComplete.Option
          key={completionValue}
          value={completionValue}
          result={result}
        >
          {renderResultItem ? renderResultItem(result) : completionValue}
        </AutoComplete.Option>
      );
    });
  }

  render() {
    const {
      renderResultItem,
      extractItemCompletionValue,
      suggesterName,
      pidType,
      ...autoCompleteProps
    } = this.props;
    return (
      <AutoComplete {...autoCompleteProps} onSearch={this.onSearch}>
        {this.renderSuggestions()}
      </AutoComplete>
    );
  }
}

Suggester.propTypes = {
  pidType: PropTypes.string.isRequired,
  suggesterName: PropTypes.string.isRequired,
  renderResultItem: PropTypes.func,
  extractItemCompletionValue: PropTypes.func,
};

Suggester.defaultProps = {
  extractItemCompletionValue: resultItem => resultItem.text,
};

export default Suggester;
