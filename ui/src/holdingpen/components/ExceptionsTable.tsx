import React, { Component } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import FilterDropdown from './FilterDropdown';
import './ExceptionsTable.scss';
import { LEGACY_URL } from '../../common/constants';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

class ExceptionsTable extends Component {
  onSelectedCollectionsChange: any;

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
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

  static getCollectionColumnFilters(exceptions: any) {
    const collectionsMap = exceptions.reduce((acc: any, exception: any) => {
      acc[exception.collection] = true;
      return acc;
    }, {});
    return Object.keys(collectionsMap).map(collection => ({
      text: collection,
      value: collection,
    }));
  }

  static hasCollection(collection: any, exception: any) {
    return exception.collection === collection;
  }

  constructor(props: any) {
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

  onErrorFilterDropdownVisibleChange(visible: any) {
    this.setState({
      isErrorFilterDropdownVisible: visible,
      isErrorFilterFocused: visible,
    });
  }

  onRecidFilterDropdownVisibleChange(visible: any) {
    this.setState({
      isRecidFilterDropdownVisible: visible,
      isRecidFilterFocused: visible,
    });
  }

  onErrorSearch(searchText: any) {
    if (!searchText) {
      this.onFilterDropdownSearchClear();
      return;
    }

    const searchRegExp = new RegExp(searchText, 'gi');
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'exceptions' does not exist on type 'Read... Remove this comment to see the full error message
    const { exceptions } = this.props;
    const filteredExceptions = exceptions.filter((exception: any) => exception.error.match(searchRegExp)
    );
    this.setState({
      isErrorFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onRecidSearch(recidText: any) {
    if (!recidText) {
      this.onFilterDropdownSearchClear();
      return;
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'exceptions' does not exist on type 'Read... Remove this comment to see the full error message
    const { exceptions } = this.props;
    const recid = Number(recidText);
    // TODO: create a lookup map in order to avoid `findIndex`
    const exceptionIndex = exceptions.findIndex(
      (exception: any) => exception.recid === recid
    );
    const filteredExceptions =
      exceptionIndex >= 0 ? [exceptions[exceptionIndex]] : [];
    this.setState({
      isRecidFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onFilterDropdownSearchClear() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'exceptions' does not exist on type 'Read... Remove this comment to see the full error message
    const { exceptions } = this.props;
    this.setState({
      isRecidFilterDropdownVisible: false,
      filteredExceptions: exceptions,
    });
  }

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'collectionColumnFilters' does not exist ... Remove this comment to see the full error message
      collectionColumnFilters,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isErrorFilterFocused' does not exist on ... Remove this comment to see the full error message
      isErrorFilterFocused,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isErrorFilterDropdownVisible' does not e... Remove this comment to see the full error message
      isErrorFilterDropdownVisible,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isRecidFilterFocused' does not exist on ... Remove this comment to see the full error message
      isRecidFilterFocused,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isRecidFilterDropdownVisible' does not e... Remove this comment to see the full error message
      isRecidFilterDropdownVisible,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'filteredExceptions' does not exist on ty... Remove this comment to see the full error message
      filteredExceptions,
    } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ placeholder: string; onSearch: (searchText... Remove this comment to see the full error message
            placeholder="Search error"
            onSearch={this.onErrorSearch}
            focused={isErrorFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isErrorFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onErrorFilterDropdownVisibleChange,
        width: '70%',
        render: (text: any) => text.split('\n', 1)[0],
      },
      {
        title: 'Record',
        dataIndex: 'recid',
        filterDropdown: (
          <FilterDropdown
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ placeholder: string; onSearch: (recidText:... Remove this comment to see the full error message
            placeholder="Go to recid"
            onSearch={this.onRecidSearch}
            focused={isRecidFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isRecidFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onRecidFilterDropdownVisibleChange,
        render: (text: any) => {
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
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
