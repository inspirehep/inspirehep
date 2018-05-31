import React, { Component } from 'react';
import { Table, Icon } from 'antd';
import PropTypes from 'prop-types';
import FilterDropdown from './FilterDropdown';

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
    };

    this.onFilterDropdownVisibleChange = this.onFilterDropdownVisibleChange.bind(
      this
    );
    this.onErrorSearch = this.onErrorSearch.bind(this);
    this.onSelectedCollectionsChange = this.onSelectedCollectionsChange.bind(
      this
    );
  }

  onFilterDropdownVisibleChange(visible) {
    this.setState({
      isErrorFilterDropdownVisible: visible,
      isErrorFilterFocused: visible,
    });
  }

  onErrorSearch(searchText) {
    const regExp = new RegExp(searchText, 'gi');
    const filteredExceptions = this.state.allExceptions.filter(exception =>
      exception.error.match(regExp)
    );
    this.setState({
      isErrorFilterDropdownVisible: false,
      filteredExceptions,
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
          { text: 'HEP', value: 'HEP' },
          { text: 'HEPNAMES', value: 'HEPNAMES' },
          { text: 'JOB', value: 'JOB' },
          { text: 'JOBHIDDEN', value: 'JOBHIDDEN' },
          { text: 'CONFERENCES', value: 'CONFERENCES' },
          { text: 'JOURNALS', value: 'JOURNALS' },
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
            onErrorSearch={this.onErrorSearch}
            focused={this.state.isErrorFilterFocused}
          />
        ),
        filterIcon: <Icon type="search" />,
        filterDropdownVisible: this.state.isErrorFilterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.onFilterDropdownVisibleChange(visible, 'error');
        },
        width: '40%',
        render: text => text.split('\n', 1)[0],
      },
      {
        title: 'Record',
        dataIndex: 'recid',
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={this.state.filteredExceptions}
        rowKey="recid"
        pagination={{ pageSize: 25 }}
        onChange={this.onSelectedCollectionsChange}
        expandedRowRender={record => (
          <p style={{ margin: 0 }}>{record.error}</p>
        )}
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
