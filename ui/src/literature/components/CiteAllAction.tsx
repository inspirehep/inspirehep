// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { stringify } from 'qs';
import { ExportOutlined } from '@ant-design/icons';

import React, { Component } from 'react';
import { Button, Menu, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import DropdownMenu from '../../common/components/DropdownMenu';
import {
  CITE_FORMAT_OPTIONS,
  MAX_CITEABLE_RECORDS,
  CITE_FILE_FORMAT,
} from '../constants';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import { downloadTextAsFile } from '../../common/utils';

class CiteAllAction extends Component {
  constructor(props: any) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.state = {
      loading: false,
    };
  }

  async onCiteClick({
    key
  }: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type 'Readonly<... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        `INSPIRE-CiteAll.${CITE_FILE_FORMAT[key].extension}`,
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        CITE_FILE_FORMAT[key].mimetype
      );
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  renderDropdownTitle(disabled: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
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
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <IconText text="cite all" icon={<ExportOutlined />} />
        </Button>
      </Tooltip>
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numberOfResults' does not exist on type ... Remove this comment to see the full error message
    const { numberOfResults } = this.props;
    const disabled = numberOfResults > MAX_CITEABLE_RECORDS;
    return (
      <ListItemAction>
        <DropdownMenu
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CiteAllAction.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
  query: PropTypes.object.isRequired,
};

export default CiteAllAction;
