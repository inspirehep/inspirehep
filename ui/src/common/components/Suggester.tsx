import React, { Component } from 'react';
import { AutoComplete } from 'antd';
import debounce from 'lodash.debounce';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http, { isCancelError } from '../http.ts';

export const REQUEST_DEBOUNCE_MS = 250;

type OwnProps = {
    pidType: string;
    suggesterName: string;
    extractUniqueItemValue?: $TSFixMeFunction;
    extractItemCompletionValue?: $TSFixMeFunction;
    renderResultItem?: $TSFixMeFunction;
    searchAsYouType?: boolean;
};

type State = $TSFixMe;

type Props = OwnProps & typeof Suggester.defaultProps;

class Suggester extends Component<Props, State> {

static defaultProps: $TSFixMe;

  constructor(props: Props) {
    super(props);

    // @ts-expect-error ts-migrate(2322) FIXME: Type 'DebouncedFunc<(value: any) => Promise<void>>... Remove this comment to see the full error message
    this.onSearch = debounce(this.onSearch.bind(this), REQUEST_DEBOUNCE_MS);
    this.onSuggestionSelect = this.onSuggestionSelect.bind(this);
    this.state = {
      results: [],
    };
  }

  async onSearch(value: $TSFixMe) {
    if (!value) {
      this.setState({ results: [] });
      return;
    }

    const { pidType, suggesterName, searchAsYouType } = this.props;
    const endpoint = searchAsYouType ? '_search_as_you_type' : '_suggest';
    const urlWithQuery = `/${pidType}/${endpoint}?${suggesterName}=${value}`;
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
    _: $TSFixMe,
    {
      suggestion,
      value: uniqueItemValue,
      completionValue
    }: $TSFixMe
  ) {
    const { onSelect, onChange } = this.props;

    if (uniqueItemValue !== completionValue) {
      onChange(completionValue);
    }

    if (onSelect) {
      onSelect(uniqueItemValue, suggestion);
    }
  }

  responseDataToResults(responseData: $TSFixMe) {
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
    return results.map((result: $TSFixMe) => {
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

Suggester.defaultProps = {
  extractUniqueItemValue: (resultItem: $TSFixMe) => resultItem.text,
  searchAsYouType: false,
};
export default Suggester;
