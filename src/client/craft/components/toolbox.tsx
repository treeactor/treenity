import React from 'react';
import { Button, Card, Col, Row, Typography } from 'antd';

export const Toolbox = () => {
  return (
    <Card title="Drag to add">
      <Row>
        <Col >
          <Button>Button</Button>
        </Col>
        <Col >
          <Button >Text</Button>
        </Col>
        <Col >
          <Button >Container</Button>
        </Col>
        <Col >
          <Button >Card</Button>
        </Col>
      </Row>
    </Card>
  )
};
