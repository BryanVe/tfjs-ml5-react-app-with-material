import React from 'react';
import { GeneralLayout } from 'layout';
import { EmotionRecognition } from './components';
import { BodyPixCapture } from 'components'
import { useLocation } from 'react-router-dom';

const faceMaskLink = 'https://ai-on-web-face-mask.netlify.app/'

const App = () => {
  const search = useLocation().search
  const indexString = new URLSearchParams(search).get('i')
  const index = indexString ? parseInt(indexString) : 0
  const [renderedComponentIndex, setRenderedComponentIndex] = React.useState(index >= 0 && index < 3 ? index : 0);
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
      iconName:'FM',
      onIconClick: () => {
        window.location.href = faceMaskLink
      },
      component: () => <a href={faceMaskLink}>redirect to face mask</a>
    }
  ]

  const switchBetweenViews = () => {
    const Component = views[renderedComponentIndex].component;

    return <Component />;
  };

  return <GeneralLayout views={views}>{switchBetweenViews()}</GeneralLayout>;
};

export default App;
