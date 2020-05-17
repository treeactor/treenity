import React from 'react';
import { Button, Card, Layout } from 'antd';

export const PrimaryButton = ({ text, forwardRef }) => {
  return <Button ref={forwardRef} type="primary">{text}</Button>;
};

export const XCard = ({ title, children, forwardRef }) => {
  return <Card ref={forwardRef} title={title}>{children}</Card>
};

export const Container = ({ children }) => {
  return <Layout>{children}</Layout>
};

export const SomeComponent = ({  }) => {
  return <Container>
    <XCard title="card">Some card text</XCard>
    <PrimaryButton>Button</PrimaryButton>
    <PrimaryButton>Button 2</PrimaryButton>
  </Container>
};
