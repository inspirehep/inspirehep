import React, { Component } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import FilterDropdown from './FilterDropdown';
import './ExceptionsTable.scss';
import { LEGACY_URL } from '../../common/constants';
import ExternalLink from '../../common/components/ExternalLink.tsx';

class ExceptionsTable extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { exceptions } = nextProps;
    const { prevExceptions } = prevState;

    if (exceptions === prevExceptions) {
      return prevState;
    }

    const collectionColumnFilters = ExceptionsTable.getCollectionColumnFilters(
      exceptions
    );
    return {
      ...prevState,
      prevExceptions: exceptions,
      filteredExceptions: exceptions,
      collectionColumnFilters,
    };
  }

  static getCollectionColumnFilters(exceptions) {
    const collectionsMap = exceptions.reduce((acc, exception) => {
      acc[exception.collection] = true;
      return acc;
    }, {});
    return Object.keys(collectionsMap).map(collection => ({
      text: collection,
      value: collection,
    }));
  }

  static hasCollection(collection, exception) {
    return exception.collection === collection;
  }

  constructor(props) {
    super(props);
    this.state = {
      isErrorFilterDropdownVisible: false,
      isErrorFilterFocused: false,
      isRecidFilterDropdownVisible: false,
      isRecidFilterFocused: false,
    };

    this.onRecidFilterDropdownVisibleChange = this.onRecidFilterDropdownVisibleChange.bind(
      this
    );
    this.onErrorFilterDropdownVisibleChange = this.onErrorFilterDropdownVisibleChange.bind(
      this
    );
    this.onErrorSearch = this.onErrorSearch.bind(this);
    this.onRecidSearch = this.onRecidSearch.bind(this);
  }

  onErrorFilterDropdownVisibleChange(visible) {
    this.setState({
      isErrorFilterDropdownVisible: visible,
      isErrorFilterFocused: visible,
    });
  }

  onRecidFilterDropdownVisibleChange(visible) {
    this.setState({
      isRecidFilterDropdownVisible: visible,
      isRecidFilterFocused: visible,
    });
  }

  onErrorSearch(searchText) {
    if (!searchText) {
      this.onFilterDropdownSearchClear();
      return;
    }

    const searchRegExp = new RegExp(searchText, 'gi');
    const { exceptions } = this.props;
    const filteredExceptions = exceptions.filter(exception =>
      exception.error.match(searchRegExp)
    );
    this.setState({
      isErrorFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onRecidSearch(recidText) {
    if (!recidText) {
      this.onFilterDropdownSearchClear();
      return;
    }

    const { exceptions } = this.props;
    const recid = Number(recidText);
    // TODO: create a lookup map in order to avoid `findIndex`
    const exceptionIndex = exceptions.findIndex(
      exception => exception.recid === recid
    );
    const filteredExceptions =
      exceptionIndex >= 0 ? [exceptions[exceptionIndex]] : [];
    this.setState({
      isRecidFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onFilterDropdownSearchClear() {
    const { exceptions } = this.props;
    this.setState({
      isRecidFilterDropdownVisible: false,
      filteredExceptions: exceptions,
    });
  }

  render() {
    const {
      collectionColumnFilters,
      isErrorFilterFocused,
      isErrorFilterDropdownVisible,
      isRecidFilterFocused,
      isRecidFilterDropdownVisible,
      filteredExceptions,
    } = this.state;
    const { loading } = this.props;

    const columns = [
      {
        title: 'Collection',
        dataIndex: 'collection',
        filters: collectionColumnFilters,
        onFilter: ExceptionsTable.hasCollection,
      },
      {
        title: 'Error',
        dataIndex: 'error',
        filterDropdown: (
          <FilterDropdown
            placeholder="Search error"
            onSearch={this.onErrorSearch}
            focused={isErrorFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isErrorFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onErrorFilterDropdownVisibleChange,
        width: '70%',
        render: text => text.split('\n', 1)[0],
      },
      {
        title: 'Record',
        dataIndex: 'recid',
        filterDropdown: (
          <FilterDropdown
            placeholder="Go to recid"
            onSearch={this.onRecidSearch}
            focused={isRecidFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isRecidFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onRecidFilterDropdownVisibleChange,
        render: text => {
          const recordLink = `${LEGACY_URL}/record/${text}/edit`;
          return <ExternalLink href={recordLink}>{text}</ExternalLink>;
        },
      },
    ];

    return (
      <Table
        className="__ExceptionsTable__"
        columns={columns}
        dataSource={filteredExceptions}
        rowKey="recid"
        rowClassName="exceptions-table-row"
        pagination={{ pageSize: 25 }}
        onChange={this.onSelectedCollectionsChange}
        expandedRowRender={record => <pre>{record.error}</pre>}
        bordered
        loading={loading}
      />
    );
  }
}

ExceptionsTable.propTypes = {
  exceptions: PropTypes.arrayOf(
    PropTypes.shape({
      collection: PropTypes.string,
      error: PropTypes.string,
      recid: PropTypes.number,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ExceptionsTable;
