import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete } from 'antd';
import debounce from 'lodash.debounce';

import http, { isCancelError } from '../http.ts';

export const REQUEST_DEBOUNCE_MS = 250;

class Suggester extends Component {
  constructor(props) {
    super(props);

    this.onSearch = debounce(this.onSearch.bind(this), REQUEST_DEBOUNCE_MS);
    this.onSuggestionSelect = this.onSuggestionSelect.bind(this);
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
    const suggesterRequestId = `${pidType}-${suggesterName}`;
    try {
      const response = await http.get(urlWithQuery, {}, suggesterRequestId);
      const results = this.responseDataToResults(response.data);
      this.setState({ results });
    } catch (error) {
      if (!isCancelError(error)) {
        this.setState({ results: [] });
      }
    }
  }

  onSuggestionSelect(
    _,
    { suggestion, value: uniqueItemValue, completionValue }
  ) {
    const { onSelect, onChange } = this.props;

    if (uniqueItemValue !== completionValue) {
      onChange(completionValue);
    }

    if (onSelect) {
      onSelect(uniqueItemValue, suggestion);
    }
  }

  responseDataToResults(responseData) {
    const { suggesterName } = this.props;
    return responseData[suggesterName][0].options;
  }

  renderSuggestions() {
    const { results } = this.state;
    const {
      renderResultItem,
      extractUniqueItemValue,
      extractItemCompletionValue,
    } = this.props;
    return results.map(result => {
      const uniqueValue = extractUniqueItemValue(result);
      const completionValue = extractItemCompletionValue
        ? extractItemCompletionValue(result)
        : uniqueValue;
      return (
        <AutoComplete.Option
          key={uniqueValue}
          value={uniqueValue}
          completionValue={completionValue}
          suggestion={result}
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
      extractUniqueItemValue,
      suggesterName,
      pidType,
      onSelect,
      ...autoCompleteProps
    } = this.props;
    return (
      <AutoComplete
        {...autoCompleteProps}
        onSelect={this.onSuggestionSelect}
        onSearch={this.onSearch}
      >
        {this.renderSuggestions()}
      </AutoComplete>
    );
  }
}

Suggester.propTypes = {
  // also accepts other antd.AutoComplete props
  pidType: PropTypes.string.isRequired,
  suggesterName: PropTypes.string.isRequired,
  extractUniqueItemValue: PropTypes.func,
  extractItemCompletionValue: PropTypes.func, // defaults to extractUniqueItemValue
  renderResultItem: PropTypes.func, // defaults to extractItemCompletionValue
};

Suggester.defaultProps = {
  extractUniqueItemValue: resultItem => resultItem.text,
};
export default Suggester;
