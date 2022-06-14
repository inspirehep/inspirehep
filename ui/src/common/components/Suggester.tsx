import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete } from 'antd';
import debounce from 'lodash.debounce';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http, { isCancelError } from '../http.ts';

export const REQUEST_DEBOUNCE_MS = 250;

class Suggester extends Component {
  constructor(props: any) {
    super(props);

    // @ts-expect-error ts-migrate(2322) FIXME: Type 'DebouncedFunc<(value: any) => Promise<void>>... Remove this comment to see the full error message
    this.onSearch = debounce(this.onSearch.bind(this), REQUEST_DEBOUNCE_MS);
    this.onSuggestionSelect = this.onSuggestionSelect.bind(this);
    this.state = {
      results: [],
    };
  }

  async onSearch(value: any) {
    if (!value) {
      this.setState({ results: [] });
      return;
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'pidType' does not exist on type 'Readonl... Remove this comment to see the full error message
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
    _: any,
    {
      suggestion,
      value: uniqueItemValue,
      completionValue
    }: any
  ) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSelect' does not exist on type 'Readon... Remove this comment to see the full error message
    const { onSelect, onChange } = this.props;

    if (uniqueItemValue !== completionValue) {
      onChange(completionValue);
    }

    if (onSelect) {
      onSelect(uniqueItemValue, suggestion);
    }
  }

  responseDataToResults(responseData: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'suggesterName' does not exist on type 'R... Remove this comment to see the full error message
    const { suggesterName } = this.props;
    return responseData[suggesterName][0].options;
  }

  renderSuggestions() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'results' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { results } = this.state;
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderResultItem' does not exist on type... Remove this comment to see the full error message
      renderResultItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractUniqueItemValue' does not exist o... Remove this comment to see the full error message
      extractUniqueItemValue,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractItemCompletionValue' does not exi... Remove this comment to see the full error message
      extractItemCompletionValue,
    } = this.props;
    return results.map((result: any) => {
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderResultItem' does not exist on type... Remove this comment to see the full error message
      renderResultItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractItemCompletionValue' does not exi... Remove this comment to see the full error message
      extractItemCompletionValue,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractUniqueItemValue' does not exist o... Remove this comment to see the full error message
      extractUniqueItemValue,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'suggesterName' does not exist on type 'R... Remove this comment to see the full error message
      suggesterName,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'pidType' does not exist on type 'Readonl... Remove this comment to see the full error message
      pidType,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSelect' does not exist on type 'Readon... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Suggester.propTypes = {
  // also accepts other antd.AutoComplete props
  pidType: PropTypes.string.isRequired,
  suggesterName: PropTypes.string.isRequired,
  extractUniqueItemValue: PropTypes.func,
  extractItemCompletionValue: PropTypes.func, // defaults to extractUniqueItemValue
  renderResultItem: PropTypes.func, // defaults to extractItemCompletionValue
  searchAsYouType: PropTypes.bool,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
Suggester.defaultProps = {
  extractUniqueItemValue: (resultItem: any) => resultItem.text,
  searchAsYouType: false,
};
export default Suggester;
