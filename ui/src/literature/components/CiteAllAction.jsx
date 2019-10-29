import { stringify } from 'qs';

import React, { Component } from 'react';
import { Button, Menu, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import omit from 'lodash.omit';
import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import DropdownMenu from '../../common/components/DropdownMenu';
import { CITE_FORMAT_OPTIONS, MAX_CITEABLE_RECORDS } from '../constants';
import http from '../../common/http';
import { searchScopes } from '../../reducers/search';
import { downloadTextAsFile } from '../../common/utils';

class CiteAllAction extends Component {
  constructor(props) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.state = {
      loading: false,
    };
  }

  async onCiteClick({ key }) {
    const { query } = this.props;
    const citeQuery = {
      // set default `sort` in case there is no `sort` in the query
      sort: searchScopes.getIn(['literature', 'query', 'sort']),
      ...omit(query, ['size', 'page']),
    };
    const queryString = stringify(citeQuery, { indices: false });
    try {
      this.setState({ loading: true });
      const response = await http.get(
        `/literature?${queryString}&size=${MAX_CITEABLE_RECORDS}`,
        {
          headers: {
            Accept: `application/${key}`,
          },
        }
      );
      this.setState({ loading: false });
      downloadTextAsFile(response.data);
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  renderDropdownTitle(disabled) {
    const { loading } = this.state;
    return (
      <Tooltip
        title={
          disabled
            ? `Only up to ${MAX_CITEABLE_RECORDS} results can be exported.`
            : null
        }
      >
        <Button icon={loading ? 'loading' : null} disabled={disabled}>
          <IconText text="cite all" type="export" />
        </Button>
      </Tooltip>
    );
  }

  render() {
    const { numberOfResults } = this.props;
    const disabled = numberOfResults > MAX_CITEABLE_RECORDS;
    return (
      <ListItemAction>
        <DropdownMenu
          disabled={disabled}
          onClick={this.onCiteClick}
          title={this.renderDropdownTitle(disabled)}
        >
          {CITE_FORMAT_OPTIONS.map(format => (
            <Menu.Item key={format.value}>{format.display}</Menu.Item>
          ))}
        </DropdownMenu>
      </ListItemAction>
    );
  }
}

CiteAllAction.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
  query: PropTypes.object.isRequired,
};

export default CiteAllAction;
