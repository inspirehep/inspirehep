import React, { Component, ComponentPropsWithoutRef, Requireable, Validator } from 'react';
import { AutoComplete } from 'antd';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';

import http, { isCancelError } from '../http';

export const REQUEST_DEBOUNCE_MS = 250;

interface SuggesterProps extends ComponentPropsWithoutRef<any> {
  pidType: string;
  suggesterName: string;
  extractUniqueItemValue: Function;
  extractItemCompletionValue: Function;
  renderResultItem: Function;
  onSelect: Function;
  onChange: Function;
  searchasyoutype: boolean;
}

interface SuggesterState {
  results: any[]
}

class Suggester extends Component<SuggesterProps, SuggesterState> {
  static propTypes: {
    pidType: Validator<string>,
    suggesterName: Validator<string>,
    extractUniqueItemValue: Function,
    extractItemCompletionValue: Function,
    renderResultItem: Function,
    searchasyoutype: Requireable<string>,
  };

  static defaultProps = {
    extractUniqueItemValue: (resultItem: { text: string }) => resultItem.text,
    searchasyoutype: "false",
  };
  
  constructor(props: SuggesterProps) {
    super(props);

    this.onSearch = debounce(this.onSearch.bind(this), REQUEST_DEBOUNCE_MS) as unknown as (value: any) => Promise<void>;
    this.onSuggestionSelect = this.onSuggestionSelect.bind(this);
    this.state = {
      results: [],
    };
  }

  async onSearch(value: string) {
    if (!value) {
      this.setState({ results: [] });
      return;
    }

    const { pidType, suggesterName, searchasyoutype } = this.props;
    const endpoint = searchasyoutype ? '_search_as_you_type' : '_suggest';
    const urlWithQuery = `/${pidType}/${endpoint}?${suggesterName}=${value}`;
    const suggesterRequestId = `${pidType}-${suggesterName}`;
    try {
      const response = await http.get(urlWithQuery, {}, suggesterRequestId);
      const results = this.responseDataToResults(response.data);
      this.setState({ results });
    } catch (error: any) {
      if (!isCancelError(error)) {
        this.setState({ results: [] });
      }
    }
  }

  onSuggestionSelect(
    _: any,
    { suggestion, value: uniqueItemValue, completionValue }: { suggestion: string, value: string, completionValue: string }
  ) {
    const { onSelect, onChange } = this.props;

    if (uniqueItemValue !== completionValue) {
      onChange(completionValue);
    }

    if (onSelect) {
      onSelect(uniqueItemValue, suggestion);
    }
  }

  responseDataToResults(responseData: any) {
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
    return results.map((result: string) => {
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
  searchasyoutype: PropTypes.string,
};

export default Suggester;
