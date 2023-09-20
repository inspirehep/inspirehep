import React, { useState } from 'react';
import {
  CopyOutlined,
  DownloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Modal, Button, Row, Alert } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import SelectBox from '../../common/components/SelectBox';
import UserAction from '../../common/components/UserAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import {
  CITE_FORMAT_OPTIONS,
  CITE_FILE_FORMAT,
  CV,
} from '../constants';
import citeArticle from '../citeArticle';
import { downloadTextAsFile } from '../../common/utils';
import RichDescription from '../../common/components/RichDescription';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';

const CiteModalAction = ({
  recordId,
  initialCiteFormat,
  onCiteFormatChange,
  page,
}: {
  recordId: string;
  initialCiteFormat: string;
  onCiteFormatChange: Function;
  page: string;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [citeContent, setCiteContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState(initialCiteFormat);
  const [citeContentCacheByFormat, setCiteContentCacheByFormat] = useState({});

  const setCiteContentFor = async (format: string) => {
    // TODO: remove this cache and rely on the browser http caching
    let cachedCiteContent: any =
      citeContentCacheByFormat[format as keyof typeof citeContentCacheByFormat];
    if (!cachedCiteContent) {
      setLoading(true);
      try {
        cachedCiteContent = await citeArticle(format, recordId);
        setCiteContentCacheByFormat({
          ...citeContentCacheByFormat,
          [format]: cachedCiteContent,
        });
        setErrorMessage(null);
        setLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(
            `Could not create cite text for the selected format. Caused by: ${error?.message}`
          );
          setLoading(false);
        }
      }
    }

    setCiteContent(cachedCiteContent);
    setFormat(format);
  };

  const onCiteClick = () => {
    setModalVisible(true);

    // initial modal open
    if (!citeContent) {
      setCiteContentFor(initialCiteFormat);
    }
  };

  const onDownloadClick = () => {
    downloadTextAsFile(
      citeContent,
      `INSPIRE-Cite-${recordId}.${
        CITE_FILE_FORMAT[format as keyof typeof CITE_FILE_FORMAT].extension
      }`,
      CITE_FILE_FORMAT[format as keyof typeof CITE_FILE_FORMAT].mimetype
    );
  };

  const onModalCancel = () => {
    setModalVisible(false);
  };

  const onFormatChange = (format: string) => {
    onCiteFormatChange(format);
    setCiteContentFor(format);
  };

  return (
    <>
      <UserAction>
        <EventTracker
          eventCategory={page}
          eventAction="Open modal"
          eventId="Cite"
        >
          <Button onClick={onCiteClick}>
            <IconText text="cite" icon={<ExportOutlined />} />
          </Button>
        </EventTracker>
      </UserAction>
      <Modal
        title="Cite Article"
        open={modalVisible}
        footer={null}
        onCancel={onModalCancel}
      >
        <LoadingOrChildren loading={loading}>
          <div>
            {errorMessage && (
              <div className="mb3">
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
            <Row justify="space-between">
              <div>
                <EventTracker
                  eventCategory={page}
                  eventAction="Copy to clipboard"
                  eventId="Copy citation"
                  eventPropName="onChange"
                  extractEventArgsToForward={(args: any[]) => [args[0]]}
                >
                  <CopyToClipboard text={citeContent} onCopy={onModalCancel}>
                    <Button style={{ marginRight: 12 }}>
                      <CopyOutlined /> Copy to Clipboard
                    </Button>
                  </CopyToClipboard>
                </EventTracker>
                <EventTracker
                  eventCategory={page}
                  eventAction="Download"
                  eventId="Download citation"
                  eventPropName="onChange"
                  extractEventArgsToForward={(args: any[]) => [args[0]]}
                >
                  <Button onClick={onDownloadClick}>
                    <DownloadOutlined /> Download
                  </Button>
                </EventTracker>
              </div>
              <EventTracker
                eventCategory={page}
                eventAction="Select"
                eventId="Cite format selection"
                eventPropName="onChange"
                extractEventArgsToForward={(args: any[]) => [args[0]]}
              >
                <SelectBox
                  style={{ width: 140 }}
                  defaultValue={initialCiteFormat}
                  onChange={onFormatChange}
                  options={CITE_FORMAT_OPTIONS}
                  data-testid="cite-format"
                />
              </EventTracker>
            </Row>
          </div>
        </LoadingOrChildren>
      </Modal>
    </>
  );
};

export default CiteModalAction;
