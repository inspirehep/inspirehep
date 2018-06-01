import React, { Component } from 'react';
import { Table, Icon } from 'antd';
import PropTypes from 'prop-types';
import FilterDropdown from './FilterDropdown';
import './ExceptionsTable.scss';

class ExceptionsTable extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { exceptions } = nextProps;
    return {
      ...prevState,
      allExceptions: exceptions,
      filteredExceptions: exceptions,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedCollections: null,
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
    this.onSelectedCollectionsChange = this.onSelectedCollectionsChange.bind(
      this
    );
    this.onErrorSearch = this.onErrorSearch.bind(this);
    this.onRecidSearch = this.onRecidSearch.bind(this);
    this.onColumnSearch = this.onColumnSearch.bind(this);
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
    const filteredExceptions = this.onColumnSearch(searchText, 'error');
    this.setState({
      isErrorFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onRecidSearch(searchText) {
    const filteredExceptions = this.onColumnSearch(searchText, 'recid');
    this.setState({
      isRecidFilterDropdownVisible: false,
      filteredExceptions,
    });
  }

  onColumnSearch(searchText, columnToSearch) {
    const regExp = new RegExp(searchText, 'gi');
    return this.state.allExceptions.filter(exception => {
      const record = String(exception[columnToSearch]);
      return record.match(regExp);
    });
  }

  onSelectedCollectionsChange(_, filters) {
    this.setState({
      selectedCollections: filters,
    });
  }

  render() {
    const selectedCollections = this.state.selectedCollections || {};

    const columns = [
      {
        title: 'Collection',
        dataIndex: 'collection',
        filters: [
          { text: 'Hep', value: 'Hep' },
          { text: 'Hepnames', value: 'Hepnames' },
          { text: 'Job', value: 'Job' },
          { text: 'Jobhidden', value: 'Jobhidden' },
          { text: 'Conferences', value: 'Conferences' },
          { text: 'Journals', value: 'Journals' },
        ],
        filteredValue: selectedCollections.collection,
        onFilter: (value, record) => record.collection.includes(value),
        width: 120,
      },
      {
        title: 'Error',
        dataIndex: 'error',
        filterDropdown: (
          <FilterDropdown
            placeholder="Search error"
            onSearch={this.onErrorSearch}
            focused={this.state.isErrorFilterFocused}
          />
        ),
        filterIcon: <Icon type="search" />,
        filterDropdownVisible: this.state.isErrorFilterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.onErrorFilterDropdownVisibleChange(visible);
        },
        width: '50%',
        render: text => text.split('\n', 1)[0],
      },
      {
        title: 'Record',
        dataIndex: 'recid',
        filterDropdown: (
          <FilterDropdown
            placeholder="Search recid"
            onSearch={this.onRecidSearch}
            focused={this.state.isRecidFilterFocused}
          />
        ),
        filterIcon: <Icon type="search" />,
        filterDropdownVisible: this.state.isRecidFilterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.onRecidFilterDropdownVisibleChange(visible);
        },
        render: text => {
          const recordLink = `http://inspirehep.net/record/${text}/edit`;
          return <a href={recordLink}>{text}</a>;
        },
      },
    ];

    return (
      <Table
        className="__ExceptionsTable__"
        columns={columns}
        dataSource={this.state.filteredExceptions}
        rowKey="recid"
        pagination={{ pageSize: 25 }}
        onChange={this.onSelectedCollectionsChange}
        expandedRowRender={record => <pre>{record.error}</pre>}
        bordered
      />
    );
  }
}

ExceptionsTable.propTypes = {
  /* eslint-disable react/no-unused-prop-types */
  exceptions: PropTypes.arrayOf(
    PropTypes.shape({
      collection: PropTypes.string,
      error: PropTypes.string,
      recid: PropTypes.number,
    })
  ).isRequired,
  /* eslint-disable react/no-unused-prop-types */
};

export default ExceptionsTable;
