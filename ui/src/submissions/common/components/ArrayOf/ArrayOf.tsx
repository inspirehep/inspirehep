/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tooltip, Form } from 'antd';

import './ArrayOf.scss';
import { LABEL_COL, WRAPPER_COL } from '../../withFormItem';

class ArrayOf extends Component {
  constructor(props: any) {
    super(props);
    this.onItemRemoveClick = this.onItemRemoveClick.bind(this);
  }

  onItemRemoveClick(value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldValue(name, value);
  }

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      name,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractKey' does not exist on type 'Read... Remove this comment to see the full error message
      extractKey,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
      label,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'labelCol' does not exist on type 'Readon... Remove this comment to see the full error message
      labelCol,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'wrapperCol' does not exist on type 'Read... Remove this comment to see the full error message
      wrapperCol,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'emptyItem' does not exist on type 'Reado... Remove this comment to see the full error message
      emptyItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'Readonly... Remove this comment to see the full error message
      values,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderItem' does not exist on type 'Read... Remove this comment to see the full error message
      renderItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'allowItemDelete' does not exist on type ... Remove this comment to see the full error message
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
              // @ts-expect-error ts-migrate(2559) FIXME: Type 'number' has no properties in common with typ... Remove this comment to see the full error message
              <Form.Item wrapperCol={24} className="items-container">
                {items &&
                  items.length > 0 &&
                  items.map((item: any, index: any) => (
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArrayOf.propTypes = {
  label: PropTypes.string,
  labelCol: PropTypes.object,
  wrapperCol: PropTypes.object,
  extractKey: PropTypes.func,
  renderItem: PropTypes.func.isRequired, // func(itemName)
  emptyItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  allowItemDelete: PropTypes.bool,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ArrayOf.defaultProps = {
  extractKey: (item: any, index: any) => index,
  allowItemDelete: true,
  label: null,
  emptyItem: null,
  labelCol: LABEL_COL,
  wrapperCol: WRAPPER_COL,
};

export default ArrayOf;
