import React, { Component } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import FilterDropdown from './FilterDropdown';
import './ExceptionsTable.scss';
import { LEGACY_URL } from '../../common/constants';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

type Props = {
    exceptions: {
        collection?: string;
        error?: string;
        recid?: number;
    }[];
    loading: boolean;
};

type State = $TSFixMe;

class ExceptionsTable extends Component<Props, State> {
  onSelectedCollectionsChange: $TSFixMe;

  static getDerivedStateFromProps(nextProps: $TSFixMe, prevState: $TSFixMe) {
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

  static getCollectionColumnFilters(exceptions: $TSFixMe) {
    const collectionsMap = exceptions.reduce((acc: $TSFixMe, exception: $TSFixMe) => {
      acc[exception.collection] = true;
      return acc;
    }, {});
    return Object.keys(collectionsMap).map(collection => ({
      text: collection,
      value: collection,
    }));
  }

  static hasCollection(collection: $TSFixMe, exception: $TSFixMe) {
    return exception.collection === collection;
  }

  constructor(props: Props) {
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

  onErrorFilterDropdownVisibleChange(visible: $TSFixMe) {
    this.setState({
      isErrorFilterDropdownVisible: visible,
      isErrorFilterFocused: visible,
    });
  }

  onRecidFilterDropdownVisibleChange(visible: $TSFixMe) {
    this.setState({
      isRecidFilterDropdownVisible: visible,
      isRecidFilterFocused: visible,
    });
  }

  onErrorSearch(searchText: $TSFixMe) {
    if (!searchText) {
      this.onFilterDropdownSearchClear();
      return;
    }

    const searchRegExp = new RegExp(searchText, 'gi');
    const { exceptions } = this.props;
    const filteredExceptions = exceptions.filter(exception =>
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
      exception.error.match(searchRegExp)
    );
    this.setState({
      isErrorFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onRecidSearch(recidText: $TSFixMe) {
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
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
            placeholder="Search error"
            // @ts-expect-error ts-migrate(2322) FIXME: Type '(searchText: any) => void' is not assignable... Remove this comment to see the full error message
            onSearch={this.onErrorSearch}
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
            focused={isErrorFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isErrorFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onErrorFilterDropdownVisibleChange,
        width: '70%',
        render: (text: $TSFixMe) => text.split('\n', 1)[0],
      },
      {
        title: 'Record',
        dataIndex: 'recid',
        filterDropdown: (
          <FilterDropdown
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
            placeholder="Go to recid"
            // @ts-expect-error ts-migrate(2322) FIXME: Type '(recidText: any) => void' is not assignable ... Remove this comment to see the full error message
            onSearch={this.onRecidSearch}
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
            focused={isRecidFilterFocused}
          />
        ),
        filterIcon: <SearchOutlined />,
        filterDropdownVisible: isRecidFilterDropdownVisible,
        onFilterDropdownVisibleChange: this.onRecidFilterDropdownVisibleChange,
        render: (text: $TSFixMe) => {
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

export default ExceptionsTable;
