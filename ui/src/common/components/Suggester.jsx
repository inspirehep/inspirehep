import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Input } from 'antd';
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
    return results.map(result => (
      <AutoComplete.Option
        key={extractItemCompletionValue(result)}
        value={extractItemCompletionValue(result)}
        result={result}
      >
        {renderResultItem
          ? renderResultItem(result)
          : extractItemCompletionValue(result)}
      </AutoComplete.Option>
    ));
  }

  render() {
    const {
      renderResultItem,
      extractItemCompletionValue,
      suggesterName,
      pidType,
      ...autoCompleteProps
    } = this.props;

    const dataTestId = autoCompleteProps['data-test-id'];
    delete autoCompleteProps['data-test-id'];
    return (
      <AutoComplete
        {...autoCompleteProps}
        onSearch={this.onSearch}
        dataSource={this.renderSuggestions()}
        optionLabelProp="value"
      >
        <Input data-test-id={dataTestId} />
      </AutoComplete>
    );
  }
}

Suggester.propTypes = {
  pidType: PropTypes.string.isRequired,
  suggesterName: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props, default extractItemCompletionValue
  renderResultItem: PropTypes.func,
  extractItemCompletionValue: PropTypes.func,
};

Suggester.defaultProps = {
  extractItemCompletionValue: resultItem => resultItem.text,
};

export default Suggester;
