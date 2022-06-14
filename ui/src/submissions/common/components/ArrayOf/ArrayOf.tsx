/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { FieldArray } from 'formik';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tooltip, Form } from 'antd';

import './ArrayOf.scss';
import { LABEL_COL, WRAPPER_COL } from '../../withFormItem';

type OwnProps = {
    label?: string;
    labelCol?: $TSFixMe;
    wrapperCol?: $TSFixMe;
    extractKey?: $TSFixMeFunction;
    renderItem: $TSFixMeFunction;
    emptyItem?: $TSFixMe | string;
    allowItemDelete?: boolean;
};

type Props = OwnProps & typeof ArrayOf.defaultProps;

class ArrayOf extends Component<Props> {

static defaultProps: $TSFixMe;

  constructor(props: Props) {
    super(props);
    this.onItemRemoveClick = this.onItemRemoveClick.bind(this);
  }

  onItemRemoveClick(value: $TSFixMe) {
    const { form, name } = this.props;
    form.setFieldValue(name, value);
  }

  render() {
    const {
      name,
      extractKey,
      label,
      labelCol,
      wrapperCol,
      emptyItem,
      values,
      renderItem,
      allowItemDelete,
    } = this.props;
    const items = values[name];
    return (
      <div className="__ArrayOf__">
        <FieldArray
          name={name}
          render={({ push, remove }) => (
            <Form.Item
              label={label && <Tooltip title={label}>{label}</Tooltip>}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              {/* @ts-expect-error ts-migrate(2559) FIXME: Type 'number' has no properties in common with typ... Remove this comment to see the full error message */}
              <Form.Item wrapperCol={24} className="items-container">
                {items &&
                  items.length > 0 &&
                  items.map((item: $TSFixMe, index: $TSFixMe) => (
                    <Row
                      key={extractKey(item, index)}
                      className="item"
                      data-test-id={`container-${name}.${index}`}
                    >
                      <Col span={22}>{renderItem(`${name}.${index}`)}</Col>
                      {allowItemDelete &&
                        items.length > 1 && (
                          <Col span={1} offset={1}>
                            <MinusCircleOutlined
                              role="button"
                              className="remove-button"
                              onClick={() => remove(index)}
                            />
                          </Col>
                        )}
                    </Row>
                  ))}
              </Form.Item>
              <Form.Item wrapperCol={wrapperCol} className="add-button">
                <Button
                  data-test-id={`${name}-add-item`}
                  type="dashed"
                  onClick={() => push(emptyItem)}
                >
                  <PlusOutlined /> Add new field
                </Button>
              </Form.Item>
            </Form.Item>
          )}
        />
      </div>
    );
  }
}

ArrayOf.defaultProps = {
  extractKey: (item: $TSFixMe, index: $TSFixMe) => index,
  allowItemDelete: true,
  label: null,
  emptyItem: null,
  labelCol: LABEL_COL,
  wrapperCol: WRAPPER_COL,
};

export default ArrayOf;
