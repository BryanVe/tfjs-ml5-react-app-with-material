import {
  Paper,
  InputBase,
  IconButton,
  withStyles,
  Button,
  Typography,
  Box,
  LinearProgress,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import {
  AddCircle as AddIcon,
  HighlightOff as DeleteIcon,
} from '@material-ui/icons';
import { useState, useEffect, useRef } from 'react';
import * as ml5 from 'ml5';
import * as p5 from 'p5';
import { result } from 'lodash';

const EmotionInput = withStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(1),
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}))(({ classes, onButtonClick }) => {
  const [name, setName] = useState('');

  return (
    <Paper variant="outlined" className={classes.root}>
      <InputBase
        value={name}
        className={classes.input}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ingrese la etiqueta de una emoción"
      />
      <IconButton
        className={classes.iconButton}
        onClick={() => {
          onButtonClick(name);
          setName('');
        }}
      >
        <AddIcon />
      </IconButton>
    </Paper>
  );
});

const EmotionInfo = withStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    margin: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(2),
  },
  info: {
    backgroundColor: 'orange',
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  delete: {
    height: theme.spacing(2),
    width: theme.spacing(2),
    position: 'absolute',
    top: -theme.spacing(1),
    right: -theme.spacing(1),
    color: 'white',
    backgroundColor: '#f48fb1',
    '&:hover': {
      backgroundColor: '#f48fb1',
    },
  },
  white: {
    color: 'white',
  },
}))(({ classes, emotion, numberOfSamples, index, onClick, color }) => {
  return (
    <Paper variant="outlined" className={classes.root}>
      <IconButton className={classes.delete} onClick={() => onClick(index)}>
        <DeleteIcon />
      </IconButton>
      <div className={classes.info} style={{ backgroundColor: color }}>
        <Typography
          variant="h6"
          classes={{
            root: classes.white,
          }}
        >
          {emotion}
        </Typography>
        <Typography
          variant="h6"
          classes={{
            root: classes.white,
          }}
        >
          {numberOfSamples}
        </Typography>
      </div>
      <Button variant="contained" color="secondary" className={classes.button}>
        Capturar emoción
      </Button>
    </Paper>
  );
});

const LinearProgressWithLabel = (props) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      style={{
        padding: 10,
      }}
    >
      {props.label && (
        <Box width={180}>
          <Typography variant="body2" color="textSecondary">
            {props.label}
          </Typography>
        </Box>
      )}
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

const EmotionRecognition = withStyles((theme) => ({
  leftContainer: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  trainingSection: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  emotionListContainer: {
    margin: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    height: '100%',
    overflow: 'auto',
  },
  videoContainer: {
    width: '100%',
  },
}))(({ classes }) => {
  const colors = [
    '#ff3d00',
    '#2979ff',
    '#ff9100',
    '#d500f9',
    '#8bc34a',
    '#ffc400',
  ];

  let p5Instance = null;

  const videoContainerRef = useRef(null);

  const [emotions, setEmotions] = useState([
    {
      name: 'Feliz',
      numberOfSamples: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
  ]);

  const [trainingProgress, setTrainingProgress] = useState(0);

  const [showLandmarks, setShowLandmarks] = useState(false);

  const handleNewEmotion = (name) => {
    let _emotions = [...emotions];
    _emotions.push({
      name,
      numberOfSamples: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    setEmotions(_emotions);
  };

  const handleDeleteEmotion = (index) => {
    let _emotions = [...emotions];
    _emotions.splice(index, 1);

    setEmotions(_emotions);

    // TODO Update model parameters
    // TODO Clean images caché
  };

  //   useEffect(() => {
  //     const timer = setInterval(() => {
  //       setTrainingProgress((prevProgress) =>
  //         prevProgress >= 100 ? 10 : prevProgress + 10
  //       );
  //     }, 800);
  //     return () => {
  //       clearInterval(timer);
  //     };
  //   }, []);

  const classifierResults = (error, results) => {
    if (error) {
      console.log(error);
    } else {
      result.forEach((emotion) => {});
    }
  };

  const s = (sketch) => {
    let video;
    let canvas;
    let faceApi;
    let mobileNet;
    let classifier;

    const detectionOptions = {
      withLandmarks: true,
      withDescriptors: false,
    };

    sketch.setup = () => {
      video = sketch.createCapture('VIDEO');
      video.parent('video-container');
      video.size(
        videoContainerRef.current.clientWidth,
        (videoContainerRef.current.clientWidth * 3) / 4
      );
      video.position(0, 0);
      video.elt.muted = true;
      video.hide();

      canvas = sketch.createCanvas(
        videoContainerRef.current.clientWidth,
        (videoContainerRef.current.clientWidth * 3) / 4
      );
      canvas.parent('video-container');

      faceApi = ml5.faceApi(video, detectionOptions, () => {
        faceApi.detect(faceApiResults);
      });

      mobileNet = ml5.featureExtractor(
        'MobileNet',
        {
          numLabels: emotions.length,
        },
        () => {
          console.log('MobileNet model loaded!');
        }
      );

      classifier = mobileNet.classification(video, () => {
        console.log('Video is ready!');
      });
    };

    const faceApiResults = (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      let detections = result;

      sketch.background(255);
      sketch.image(video, 0, 0, sketch.width, sketch.height);

      if (detections) {
        if (detections.length > 0) {
          console.log(showLandmarks);
          drawBox(detections);
          drawLandmarks(detections);
        }
      }

      faceApi.detect(faceApiResults);
    };

    function drawLandmarks(detections) {
      sketch.noFill();
      sketch.stroke(161, 95, 251);
      sketch.strokeWeight(2);

      for (let i = 0; i < detections.length; i += 1) {
        const mouth = detections[i].parts.mouth;
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;

        drawPart(mouth, true);
        drawPart(nose, false);
        drawPart(leftEye, true);
        drawPart(leftEyeBrow, false);
        drawPart(rightEye, true);
        drawPart(rightEyeBrow, false);
      }
    }

    function drawBox(detections) {
      for (let i = 0; i < detections.length; i += 1) {
        const alignedRect = detections[i].alignedRect;
        const x = alignedRect._box._x;
        const y = alignedRect._box._y;
        const boxWidth = alignedRect._box._width;
        const boxHeight = alignedRect._box._height;

        sketch.noFill();
        sketch.stroke(161, 95, 251);
        sketch.strokeWeight(2);
        sketch.rect(x, y, boxWidth, boxHeight);
      }
    }

    function drawPart(feature, closed) {
      sketch.beginShape();
      for (let i = 0; i < feature.length; i += 1) {
        const x = feature[i]._x;
        const y = feature[i]._y;
        sketch.vertex(x, y);
      }

      if (closed === true) {
        sketch.endShape('CLOSE');
      } else {
        sketch.endShape();
      }
    }
  };

  useEffect(() => {
    p5Instance = new p5(s);
  }, []);

  return (
    <div>
      <Paper
        variant="outlined"
        classes={{
          root: classes.leftContainer,
        }}
      >
        <div
          ref={videoContainerRef}
          id="video-container"
          className={classes.videoContainer}
        ></div>
        <FormControlLabel
          value={showLandmarks}
          control={
            <Checkbox
              color="primary"
              onChange={(event) => setShowLandmarks(event.target.checked)}
            />
          }
          label="Mostrar landmarks"
          labelPlacement="start"
        />
        <Paper
          variant="outlined"
          style={{
            margin: 10,
          }}
        >
          {emotions.map((emotion, index) => {
            return (
              <LinearProgressWithLabel
                key={index}
                value={trainingProgress}
                label={emotion.name}
              />
            );
          })}
        </Paper>
      </Paper>
      <Paper
        variant="outlined"
        classes={{
          root: classes.leftContainer,
        }}
      >
        <EmotionInput onButtonClick={handleNewEmotion} />
        <Paper className={classes.emotionListContainer}>
          {emotions.map(({ name, numberOfSamples, color }, index) => {
            return (
              <EmotionInfo
                key={index}
                index={index}
                emotion={name}
                numberOfSamples={numberOfSamples}
                onClick={handleDeleteEmotion}
                color={color}
              />
            );
          })}
        </Paper>
        <Paper className={classes.trainingSection}>
          <Button variant="contained" color="primary">
            Entrenar modelo
          </Button>
          <LinearProgressWithLabel value={trainingProgress} />
        </Paper>
      </Paper>
    </div>
  );
});

export default EmotionRecognition;
