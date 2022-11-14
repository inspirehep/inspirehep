import React, { useState, useEffect } from 'react';
import { Row, Col, Upload, Button, Form, Alert, UploadFile } from 'antd';
import { Map, List } from 'immutable';
import { InboxOutlined } from '@ant-design/icons';

import './BibliographyGenerator.less';
import CollapsableForm from '../submissions/common/components/CollapsableForm';
import CollapsableFormSection from '../submissions/common/components/CollapsableForm/CollapseFormSection';
import SelectBox from '../common/components/SelectBox';
import ErrorAlert from '../common/components/ErrorAlert';
import DocumentHead from '../common/components/DocumentHead';
import { LATEX_EXAMPLE_1, LATEX_EXAMPLE_2 } from './latexExample';

const { Dragger } = Upload;

const BIBLIOGRAPHY_GENERATOR_FORMATS = [
  { value: 'bibtex', display: 'BibTeX' },
  { value: 'latex_us', display: 'LaTeX (US)' },
  { value: 'latex_eu', display: 'LaTeX (EU)' },
];

const META_DESCRIPTION =
  'Generate a LaTeX/BibTeX bibliography from citations in a LaTeX file.';

const TITLE = 'Bibliography Generator';

const Cite = ({ children }: { children: JSX.Element | string }) => (
  <code>\cite{`{${children}}`}</code>
);

function BibliographyGenerator({
  onSubmit,
  loading,
  data,
  citationErrors,
  error,
}: {
  onSubmit: (values: any) => void;
  loading: boolean;
  data: Map<string, string>;
  citationErrors: List<Map<string, string>>;
  error: Map<string, string>;
}) {
  const [fileList, setFileList] = useState<UploadFile<any>[] | undefined>();

  const uploadProps = {
    onRemove: () => {
      setFileList(undefined);
    },
    beforeUpload: (f: any) => {
      setFileList([f]);
      return false;
    },
  };

  useEffect(() => {
    if (data) {
      window.open(data.get('download_url'), '_self');
    }
  }, [data]);

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row justify="center" className="overflow-x-auto">
        <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
          <Row className="mb3 pa3 bg-white">
            <Col>
              <h2>Bibliography generator</h2>
              <p>
                Generate a LaTeX/BibTeX bibliography from citations in a LaTeX
                file.
              </p>
            </Col>
          </Row>
          <Form
            name="bibliography-generator-form"
            onFinish={onSubmit}
            initialValues={{
              format: BIBLIOGRAPHY_GENERATOR_FORMATS[0].value,
            }}
          >
            <Row>
              <Col>
                <CollapsableForm>
                  <CollapsableFormSection header="Example" key="example">
                    <p>
                      <strong>
                        Here is an example of a LaTeX file that could be sent to
                        our bibliography service, the output as LaTeX is shown
                        below.
                      </strong>
                    </p>
                    <pre className="latex-example">{LATEX_EXAMPLE_1}</pre>

                    <p>
                      <strong>
                        This will warn about the unknown reference to{' '}
                        <code>hep-scifi/0101001</code> and generate a file
                        containing:
                      </strong>
                    </p>
                    <pre className="latex-example">{LATEX_EXAMPLE_2}</pre>
                  </CollapsableFormSection>
                </CollapsableForm>

                <Row className="pa3 bg-white">
                  <Col>
                    <Row className="mb3">
                      <Col>
                        <h3>Instructions</h3>
                        <p>
                          Write your paper in LaTeX as usual. Cite papers in
                          your LaTeX file using the <Cite>...</Cite> macro. The
                          citation keys will be used to retrieve the
                          bibliographic information for the referenced papers
                          from the INSPIRE database. The following types of
                          citation keys are supported:
                        </p>
                        <ol>
                          <li>
                            INSPIRE Texkeys, e.g. <Cite>Beacom:2010kk</Cite>
                          </li>
                          <li>
                            arXiv eprint numbers, e.g. <Cite>1004.3311</Cite> or{' '}
                            <Cite>hep-th/9711200</Cite>
                          </li>
                          <li>
                            Journal references as present on INSPIRE, with the
                            spaces and dots removed from the title, and dots
                            used as separator between title, volume and
                            page-number/article ID, e.g.{' '}
                            <Cite>PhysRev.D66.010001</Cite>
                          </li>
                          <li>
                            ADS bibcodes, e.g. <Cite>1999IJTP...38.1113M</Cite>
                          </li>
                          <li>
                            Report numbers, e.g.{' '}
                            <Cite>CERN-PH-EP-2012-218</Cite>
                          </li>
                        </ol>
                        <p>
                          You can then upload your LaTeX file here to generate a
                          list of the references in the order they are cited in
                          your paper. You’ll receive an output file that can be
                          used as a BibTeX database or copy/pasted in the
                          bibliography environment depending on the selected
                          format. In case some citations can’t be found or are
                          ambiguous, you’ll receive an error message (but a
                          bibliography will still be generated for the other
                          citations).
                        </p>
                        <p>Notes:</p>
                        <ul>
                          <li>
                            You can cite multiple papers at once by separating
                            the keys with commas, such as{' '}
                            <Cite>Beacom:2010kk, hep-th/9711200</Cite>. Each of
                            them will appear as a separate entry in the
                            bibliography.
                          </li>
                          <li>
                            The reference will always appear in the same format
                            regardless of how you cite it so if you have a
                            choice, use the eprint number as the identifier
                            rather than a journal publication note for
                            simplicity.
                          </li>
                          <li>
                            Do not worry about whether you have cited something
                            before, INSPIRE will get the order right based on
                            when you cited the references in the paper.
                          </li>
                          <li>
                            The only allowed characters in <Cite>...</Cite>{' '}
                            commands are letters, numbers and the following
                            punctuation characters: &ldquo;-&rdquo;,
                            &ldquo;/&rdquo;, &ldquo;:&rdquo;, &ldquo;,&rdquo;
                            and &ldquo;.&rdquo;. If your citation key contains
                            anything else, it will not be processed.
                          </li>
                          <li>
                            You have to send a LaTeX file containing citations,
                            you can’t send a BibTeX database.
                          </li>
                        </ul>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          name="fileupload"
                          rules={[
                            {
                              required: true,
                              message: 'Please select a file',
                            },
                          ]}
                        >
                          <Dragger
                            {...uploadProps}
                            accept=".tex"
                            name="file"
                            fileList={fileList}
                          >
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">LaTeX file</p>
                            <p className="ant-upload-hint">
                              Click or drag file to this area to upload
                            </p>
                          </Dragger>
                        </Form.Item>
                        <Form.Item label="Output format" name="format">
                          <SelectBox options={BIBLIOGRAPHY_GENERATOR_FORMATS} />
                        </Form.Item>
                      </Col>
                    </Row>
                    {citationErrors && (
                      <Row className="mb3">
                        <Col span={24}>
                          {citationErrors.map((e) => (
                            <div className="mb2">
                              <Alert
                                type="warning"
                                message={e.get('message')}
                              />
                            </div>
                          ))}
                        </Col>
                      </Row>
                    )}
                    {error && (
                      <Row className="mb3">
                        <Col span={24}>
                          <ErrorAlert message={error.get('message')} />
                        </Col>
                      </Row>
                    )}
                    <Row justify="end">
                      <Form.Item className="no-margin-bottom">
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={!fileList}
                          loading={loading}
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </>
  );
}

export default BibliographyGenerator;
