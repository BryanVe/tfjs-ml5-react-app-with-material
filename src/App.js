import React from 'react';
import { GeneralLayout } from 'layout';
import { EmotionRecognition } from './components';

import { BodyPixCapture } from 'components'
// import '@tensorflow/tfjs-backend-webgl';

const App = () => {
  const [renderedComponentIndex, setRenderedComponentIndex] = React.useState(0);
  const views = [
    {
      iconName: 'MF',
      onIconClick: () => setRenderedComponentIndex(0),
      component: () => <BodyPixCapture />
    },
    {
      iconName: 'RE',
      onIconClick: () => setRenderedComponentIndex(1),
      component: () => <EmotionRecognition />,
    },
    {
      iconName: 'HM',
      onIconClick: () => setRenderedComponentIndex(2),
      component: () => <div>HM</div>,
    },
  ];

  const switchBetweenViews = () => {
    const Component = views[renderedComponentIndex].component;

    return <Component />;
  };

  return <GeneralLayout views={views}>{switchBetweenViews()}</GeneralLayout>;
};

export default App;
