import React, { Component } from 'react';
import QuillEditor, { Quill } from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.scss';
import EditorToolbar from './EditorToolbar';

// change default text default (`P`)
const Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);

const QUILL_MODULES = {
  toolbar: '#toolbar',
};

const QUILL_FORMATS = ['bold', 'italic', 'list', 'bullet', 'link'];

class RichTextEditor extends Component {
static propTypes = (QuillEditor as $TSFixMe).propTypes;

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'data-test-type' does not exist on type '... Remove this comment to see the full error message
      'data-test-type': dataTestType,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'data-test-id' does not exist on type 'Re... Remove this comment to see the full error message
      'data-test-id': dataTestId,
      ...quillProps
    } = this.props;
    return (
      <div
        className="__RichTextEditor__ ant-input"
        data-test-type={dataTestType}
        data-test-id={dataTestId}
      >
        <div id="toolbar">
          <EditorToolbar />
        </div>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <QuillEditor
          theme="snow"
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          {...quillProps}
        />
      </div>
    );
  }
}

export default RichTextEditor;
