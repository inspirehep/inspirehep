import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Icon } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import citeArticle from '../citeArticle';
import SelectBox from '../../common/components/SelectBox';
import ListItemAction from '../../common/components/ListItemAction';

const FORMAT_SELECT_OPTIONS = [
  { value: 'x-bibtex', display: 'BibTex' },
  { value: 'vnd+inspire.latex.eu+x-latex', display: 'LaTex (EU)' },
  { value: 'vnd+inspire.latex.us+x-latex', display: 'LaTex (US)' },
];

export const DEFAULT_FORMAT = FORMAT_SELECT_OPTIONS[0].value;

class CiteModalAction extends Component {
  constructor(props) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.setCiteContentFor = this.setCiteContentFor.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);

    this.state = {
      modalVisible: false,
    };
    this.citeContentCacheByFormat = {};
  }

  onCiteClick() {
    const { citeContent } = this.state;
    this.setState({ modalVisible: true });

    // initial modal open
    if (!citeContent) {
      this.setCiteContentFor(DEFAULT_FORMAT);
    }
  }

  onDownloadClick() {
    const { citeContent } = this.state;
    window.open(
      `data:application/txt,${encodeURIComponent(citeContent)}`,
      '_self'
    );
  }

  onModalCancel() {
    this.setState({ modalVisible: false });
  }

  async setCiteContentFor(format) {
    let citeContent = this.citeContentCacheByFormat[format];
    if (!citeContent) {
      const { recordId } = this.props;
      citeContent = await citeArticle(format, recordId);
      this.citeContentCacheByFormat[format] = citeContent;
    }

    this.setState({ citeContent });
  }

  render() {
    const { modalVisible, citeContent } = this.state;
    return (
      <div className="di">
        <ListItemAction
          onClick={this.onCiteClick}
          iconType="export"
          text="cite"
        />
        <Modal
          title="Cite Article"
          width="50%"
          visible={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          <div>
            <Row>
              <pre>{citeContent}</pre>
            </Row>
            <Row type="flex" justify="space-between">
              <div>
                <CopyToClipboard text={citeContent} onCopy={this.onModalCancel}>
                  <Button style={{ marginRight: 12 }}>
                    <Icon type="copy" /> Copy to Clipboard
                  </Button>
                </CopyToClipboard>
                <Button onClick={this.onDownloadClick}>
                  <Icon type="download" /> Download
                </Button>
              </div>
              <SelectBox
                style={{ width: 140 }}
                defaultValue={DEFAULT_FORMAT}
                onChange={this.setCiteContentFor}
                options={FORMAT_SELECT_OPTIONS}
              />
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

CiteModalAction.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default CiteModalAction;
