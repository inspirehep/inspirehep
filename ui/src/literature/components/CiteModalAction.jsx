import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Row, Icon, Alert } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import SelectBox from '../../common/components/SelectBox';
import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import { CITE_FORMAT_OPTIONS, CITE_FORMAT_VALUES } from '../constants';
import citeArticle from '../citeArticle';

class CiteModalAction extends Component {
  constructor(props) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onFormatChange = this.onFormatChange.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);

    this.state = {
      modalVisible: false,
      errorMessage: null,
    };
    this.citeContentCacheByFormat = {};
  }

  onCiteClick() {
    const { citeContent } = this.state;
    this.setState({ modalVisible: true });

    // initial modal open
    if (!citeContent) {
      const { initialCiteFormat } = this.props;
      this.setCiteContentFor(initialCiteFormat);
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

  onFormatChange(format) {
    const { onCiteFormatChange } = this.props;
    onCiteFormatChange(format);
    this.setCiteContentFor(format);
  }

  async setCiteContentFor(format) {
    let citeContent = this.citeContentCacheByFormat[format];
    if (!citeContent) {
      const { recordId } = this.props;
      try {
        citeContent = await citeArticle(format, recordId);
        this.citeContentCacheByFormat[format] = citeContent;
        this.setState({ errorMessage: null });
      } catch (error) {
        this.setState({
          errorMessage: `Could not create cite text for the selected format. Caused by: ${
            error.message
          }`,
        });
      }
    }

    this.setState({ citeContent });
  }

  render() {
    const { initialCiteFormat } = this.props;
    const { modalVisible, citeContent, errorMessage } = this.state;
    return (
      <>
        <ListItemAction>
          <EventTracker eventId="Cite">
            <Button onClick={this.onCiteClick}>
              <IconText text="cite" type="export" />
            </Button>
          </EventTracker>
        </ListItemAction>
        <Modal
          title="Cite Article"
          width="50%"
          visible={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          <div>
            {errorMessage && (
              <div className="mb3">
                <Alert type="error" showIcon description={errorMessage} />
              </div>
            )}
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
              <EventTracker
                eventId="CiteFormatSelection"
                eventPropName="onChange"
                extractEventArgsToForward={args => [args[0]]}
              >
                <SelectBox
                  style={{ width: 140 }}
                  defaultValue={initialCiteFormat}
                  onChange={this.onFormatChange}
                  options={CITE_FORMAT_OPTIONS}
                />
              </EventTracker>
            </Row>
          </div>
        </Modal>
      </>
    );
  }
}

CiteModalAction.propTypes = {
  recordId: PropTypes.number.isRequired,
  initialCiteFormat: PropTypes.oneOf(CITE_FORMAT_VALUES).isRequired,
  onCiteFormatChange: PropTypes.func.isRequired,
};

export default CiteModalAction;
