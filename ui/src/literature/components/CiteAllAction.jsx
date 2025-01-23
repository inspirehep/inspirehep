import { stringify } from 'qs';
import { ExportOutlined } from '@ant-design/icons';

import React, { Component } from 'react';
import { Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import UserAction from '../../common/components/UserAction';
import IconText from '../../common/components/IconText';
import DropdownMenu from '../../common/components/DropdownMenu';
import {
  CITE_FORMAT_OPTIONS,
  MAX_CITEABLE_RECORDS,
  CITE_FILE_FORMAT,
} from '../constants';
import http from '../../common/http';
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
      ...query,
      page: 1,
      size: MAX_CITEABLE_RECORDS,
    };
    const queryString = stringify(citeQuery, { indices: false });
    try {
      this.setState({ loading: true });
      const response = await http.get(`/literature?${queryString}`, {
        headers: {
          Accept: key,
        },
      });
      this.setState({ loading: false });
      downloadTextAsFile(
        response.data,
        `INSPIRE-CiteAll.${CITE_FILE_FORMAT[key].extension}`,
        CITE_FILE_FORMAT[key].mimetype
      );
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
        <Button loading={loading} disabled={disabled}>
          <IconText text="cite all" icon={<ExportOutlined />} />
        </Button>
      </Tooltip>
    );
  }

  render() {
    const { numberOfResults } = this.props;
    const disabled = numberOfResults > MAX_CITEABLE_RECORDS;
    return (
      <UserAction>
        <DropdownMenu
          disabled={disabled}
          onClick={this.onCiteClick}
          title={this.renderDropdownTitle(disabled)}
          items={CITE_FORMAT_OPTIONS.map((format) => ({
            key: format.value,
            label: <span key={format.value}>{format.display}</span>,
          }))}
        />
      </UserAction>
    );
  }
}

CiteAllAction.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
  query: PropTypes.object.isRequired,
};

export default CiteAllAction;
