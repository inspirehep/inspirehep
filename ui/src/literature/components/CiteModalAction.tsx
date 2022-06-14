import React, { Component } from 'react';
import {
  CopyOutlined,
  DownloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Modal, Button, Row, Alert } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { CopyToClipboard } from 'react-copy-to-clipboard';

import SelectBox from '../../common/components/SelectBox';
import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import {
  CITE_FORMAT_OPTIONS,
  CITE_FORMAT_VALUES,
  CITE_FILE_FORMAT,
  CV,
} from '../constants';
import citeArticle from '../citeArticle';
import { downloadTextAsFile } from '../../common/utils';
import RichDescription from '../../common/components/RichDescription';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';

type Props = {
    recordId: number;
    initialCiteFormat: $TSFixMe; // TODO: PropTypes.oneOf(CITE_FORMAT_VALUES)
    onCiteFormatChange: $TSFixMeFunction;
};

type State = $TSFixMe;

class CiteModalAction extends Component<Props, State> {
  citeContentCacheByFormat: $TSFixMe;

  constructor(props: Props) {
    super(props);
    this.onCiteClick = this.onCiteClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onFormatChange = this.onFormatChange.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);

    this.state = {
      modalVisible: false,
      errorMessage: null,
      loading: false,
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
    const { citeContent, format } = this.state;
    const { recordId } = this.props;
    downloadTextAsFile(
      citeContent,
      `INSPIRE-Cite-${recordId}.${      
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
CITE_FILE_FORMAT[format].extension}`,
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      CITE_FILE_FORMAT[format].mimetype
    );
  }

  onModalCancel() {
    this.setState({ modalVisible: false });
  }

  onFormatChange(format: $TSFixMe) {
    const { onCiteFormatChange } = this.props;
    onCiteFormatChange(format);
    this.setCiteContentFor(format);
  }

  async setCiteContentFor(format: $TSFixMe) {
    // TODO: remove this cache and rely on the browser http caching
    let citeContent = this.citeContentCacheByFormat[format];
    if (!citeContent) {
      const { recordId } = this.props;
      this.setState({ loading: true });
      try {
        citeContent = await citeArticle(format, recordId);
        this.citeContentCacheByFormat[format] = citeContent;
        this.setState({ errorMessage: null, loading: false });
      } catch (error) {
        this.setState({
    errorMessage: `Could not create cite text for the selected format. Caused by: ${(error as $TSFixMe).message}`,
    loading: false,
});
      }
    }

    this.setState({ citeContent, format });
  }

  render() {
    const { initialCiteFormat } = this.props;
    const {
      modalVisible,
      citeContent,
      errorMessage,
      format,
      loading,
    } = this.state;
    return <>
      <ListItemAction>
        {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
        <EventTracker eventId="Cite">
          <Button onClick={this.onCiteClick}>
            <IconText text="cite" icon={<ExportOutlined />} />
          </Button>
        </EventTracker>
      </ListItemAction>
      <Modal
        title="Cite Article"
        visible={modalVisible}
        footer={null}
        onCancel={this.onModalCancel}
      >
        <LoadingOrChildren loading={loading}>
          <div>
            {errorMessage && (
              <div className="mb3">
                {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
                <Alert type="error" showIcon description={errorMessage} />
              </div>
            )}
            <Row>
              {format === CV ? (
                <RichDescription>{citeContent}</RichDescription>
              ) : (
                <pre>{citeContent}</pre>
              )}
            </Row>
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
            <Row type="flex" justify="space-between">
              <div>
                <CopyToClipboard
                  text={citeContent}
                  onCopy={this.onModalCancel}
                >
                  <Button style={{ marginRight: 12 }}>
                    <CopyOutlined /> Copy to Clipboard
                  </Button>
                </CopyToClipboard>
                <Button onClick={this.onDownloadClick}>
                  <DownloadOutlined /> Download
                </Button>
              </div>
              {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
              <EventTracker
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
                eventId="CiteFormatSelection"
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
                eventPropName="onChange"
                // @ts-expect-error ts-migrate(2322) FIXME: Type '(args: $TSFixMe) => any[]' is not assignable... Remove this comment to see the full error message
                extractEventArgsToForward={(args: $TSFixMe) => [args[0]]}
              >
                <SelectBox
                  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ style: { width: number; }; defaultValue: a... Remove this comment to see the full error message
                  style={{ width: 140 }}
                  defaultValue={initialCiteFormat}
                  onChange={this.onFormatChange}
                  options={CITE_FORMAT_OPTIONS}
                />
              </EventTracker>
            </Row>
          </div>
        </LoadingOrChildren>
      </Modal>
    </>;
  }
}

export default CiteModalAction;
