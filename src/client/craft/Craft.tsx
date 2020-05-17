import React from 'react';
import { Canvas, Editor, Frame, useNode } from '@craftjs/core';
import { Toolbox } from './components/toolbox';
import { Container, PrimaryButton, SomeComponent, XCard } from './components';
import { Card, Layout } from 'antd';

const createDrag = (Component, inline = false): React.FC<any> => (props) => {
  const { connectors: { connect, drag } } = useNode();

  return (<div ref={ref => connect(drag(ref))} style={{ display: inline ? 'inline-block' : 'block' }}>
    <Component {...props} />
  </div>);
};

const Btn = createDrag(PrimaryButton, true);
const XXCard = createDrag(XCard);
// const Container = create

const Craft = ({}) => {
  return (
    <div>
      <Editor resolver={{ Btn, XXCard }}>
        <Toolbox />
        <Frame>
          <Canvas is={Card}>
            <Btn text="Button" />
            <Btn text="Button 2" />
            <Canvas>
              <XXCard title="Card" />
              <Btn text="Button 3" />
            </Canvas>
          </Canvas>
        </Frame>
      </Editor>
    </div>
  );
};

export default Craft;
