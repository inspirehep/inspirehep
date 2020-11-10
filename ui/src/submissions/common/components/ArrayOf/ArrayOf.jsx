/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tooltip, Form } from 'antd';

import './ArrayOf.scss';
import { LABEL_COL, WRAPPER_COL } from '../../withFormItem';

class ArrayOf extends Component {
  constructor(props) {
    super(props);
    this.onItemRemoveClick = this.onItemRemoveClick.bind(this);
  }

  onItemRemoveClick(value) {
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
              <Form.Item wrapperCol={24} className="items-container">
                {items &&
                  items.length > 0 &&
                  items.map((item, index) => (
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

ArrayOf.propTypes = {
  label: PropTypes.string,
  labelCol: PropTypes.object,
  wrapperCol: PropTypes.object,
  extractKey: PropTypes.func,
  renderItem: PropTypes.func.isRequired, // func(itemName)
  emptyItem: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  allowItemDelete: PropTypes.bool,
};

ArrayOf.defaultProps = {
  extractKey: (item, index) => index,
  allowItemDelete: true,
  label: null,
  emptyItem: null,
  labelCol: LABEL_COL,
  wrapperCol: WRAPPER_COL,
};

export default ArrayOf;
