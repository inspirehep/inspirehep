// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { stringify } from 'qs';
import { ExportOutlined } from '@ant-design/icons';

import React, { Component } from 'react';
import { Button, Menu, Tooltip } from 'antd';
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

type Props = {
    numberOfResults: number;
    query: $TSFixMe;
};

type State = $TSFixMe;

class CiteAllAction extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.state = {
      loading: false,
    };
  }

  async onCiteClick({
    key
  }: $TSFixMe) {
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
        `INSPIRE-CiteAll.${        
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
CITE_FILE_FORMAT[key].extension}`,
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        CITE_FILE_FORMAT[key].mimetype
      );
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  renderDropdownTitle(disabled: $TSFixMe) {
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

export default CiteAllAction;
