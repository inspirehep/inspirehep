import React, { useCallback, useState, useEffect } from 'react';
import { Input, AutoComplete } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Set } from 'immutable';

import './SearchBox.less';
import SearchBoxNamespaceSelectContainer from '../../containers/SearchBoxNamespaceSelectContainer';
import { readHistory, persistHistory } from './searchHistory';
import IconText from '../IconText';

let HISTORY_BY_NAMESPACE = {};
readHistory((history: History) => {
  HISTORY_BY_NAMESPACE = history;
});

const SearchBox = ({
  value,
  placeholder,
  onSearch,
  namespace,
  className,
}: {
  value?: string;
  placeholder?: string;
  onSearch: Function;
  namespace: string;
  className?: string;
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<
    Set<{ value: any; label: JSX.Element }> | never[]
  >([]);
  const [shouldSearch, setShouldSearch] = useState(false);

  // always override inputValue when `value` prop is changed
  useEffect(() => {
    // set empty string if `value` is null to force clearing text value of internal Input field.
    const valueOrEmpty = value != null ? value : '';
    setInputValue(valueOrEmpty);
  }, [value]);

  const onInputChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      const namespaceHistory: Set<string> =
        HISTORY_BY_NAMESPACE[namespace as keyof typeof HISTORY_BY_NAMESPACE];
      if (
        newValue &&
        HISTORY_BY_NAMESPACE[namespace as keyof typeof HISTORY_BY_NAMESPACE]
      ) {
        const options: Set<{ value: any; label: JSX.Element }> =
          namespaceHistory
            .filter((searchQuery: string | any[]) =>
              searchQuery.includes(newValue)
            )
            .map((searchQuery: any) => ({
              value: searchQuery,
              label: <IconText icon={<HistoryOutlined />} text={searchQuery} />,
            }));
        setAutoCompleteOptions(options);
      } else {
        setAutoCompleteOptions([]);
      }
    },
    [namespace]
  );
  const onInputSearch = useCallback(() => {
    setShouldSearch(true);
  }, []);

  const onAutoCompleteSelect = useCallback((selectedValue) => {
    setInputValue(selectedValue);
    setShouldSearch(true);
  }, []);

  useEffect(
    () => {
      // FIXME: do it without an effect.
      // HACK: to perform a search only once after `Input.Search.onSearch` or `AutoComplete.onSelect`
      // since `onSelect` is called after `onSearch`, we can't do this `onSearch`.
      if (shouldSearch) {
        onSearch(namespace, inputValue);

        if (inputValue) {
          (
            HISTORY_BY_NAMESPACE[
              namespace as keyof typeof HISTORY_BY_NAMESPACE
            ] as Set<string>
          ).add(inputValue.trim());
          persistHistory(HISTORY_BY_NAMESPACE);
        }
        setShouldSearch(false);
        setAutoCompleteOptions([]);
      }
    },
    [shouldSearch] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    // HACK: autocomplete select and scope select interferes with each other
    // when search scope is rendered using `Input.addonBefore` prop, inside autocomplete
    // that's why it's pulled out, and classNames are set manually to make it look like an addon
    <>
      <span className={classNames('__SearchBox__ ant-input-group', className)}>
        <span className="ant-input-group-addon">
          <SearchBoxNamespaceSelectContainer />
        </span>
        <AutoComplete
          autoFocus
          popupClassName="header-dropdown"
          className="autocomplete"
          value={inputValue}
          dropdownMatchSelectWidth
          options={autoCompleteOptions}
          onSelect={onAutoCompleteSelect}
        >
          <Input.Search
            data-test-id="search-box-input"
            placeholder={placeholder}
            size="large"
            enterButton
            onChange={onInputChange}
            onSearch={onInputSearch}
          />
        </AutoComplete>
      </span>
    </>
  );
};

export default SearchBox;
