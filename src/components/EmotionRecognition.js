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
  makeStyles,
} from '@material-ui/core';
import {
  AddCircle as AddIcon,
  HighlightOff as DeleteIcon,
} from '@material-ui/icons';
import { useState, useEffect, useRef } from 'react';
import * as ml5 from 'ml5';
import * as p5 from 'p5';

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
}))(({ classes, onButtonClick, enable }) => {
  const [name, setName] = useState('');

  return (
    <Paper variant="outlined" className={classes.root}>
      <InputBase
        disabled={!enable}
        value={name}
        className={classes.input}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ingrese la etiqueta de una emoción"
      />
      <IconButton
        disabled={!enable}
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
}))(
  ({
    classes,
    emotion,
    numberOfSamples,
    index,
    onClick,
    color,
    deleteEnabled,
  }) => {
    return (
      <Paper variant="outlined" className={classes.root}>
        {deleteEnabled && (
          <IconButton className={classes.delete} onClick={() => onClick(index)}>
            <DeleteIcon />
          </IconButton>
        )}
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
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
        >
          Capturar emoción
        </Button>
      </Paper>
    );
  }
);

const LinearProgressWithLabel = (props) => {
  const classes = makeStyles({
    bar: {
      backgroundColor: props.barColor,
    },
  })();

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
        <LinearProgress
          variant="determinate"
          value={props.value}
          classes={{
            bar1Determinate: classes.bar,
          }}
        />
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

  const [emotions, setEmotions] = useState([
    {
      name: 'Feliz',
      numberOfSamples: 100,
      probability: 30,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
  ]);

  const [trainingProgress, setTrainingProgress] = useState(0);

  const [initializing, setInitializing] = useState(true);

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

  //

  let faceapi = useRef();
  let mobilenet = useRef();
  let classifier = useRef();
  let showLandmarks = useRef(false);
  let video = useRef();
  let detections;
  const width = 400;
  const height = 300;
  let canvas = useRef();
  let ctx;

  // by default all options are set to true
  const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false,
  };

  useEffect(() => {
    make();
  }, []);

  async function make() {
    // get the video
    video.current = await getVideo();

    canvas.current = createCanvas(width, height);
    ctx = canvas.current.getContext('2d');

    faceapi.current = ml5.faceApi(video.current, detectionOptions, modelReady);
  }

  function modelReady() {
    console.log('ready!');
    faceapi.current.detect(gotFaceApiResults);
  }

  let gotFaceApiResults = (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    detections = result;

    // Clear part of the canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(video.current, 0, 0, width, height);

    if (detections) {
      if (detections.length > 0) {
        drawBox(detections);

        if (showLandmarks.current) {
          drawLandmarks(detections);
        }
      }
    }

    faceapi.current.detect(gotFaceApiResults);
  };

  function drawBox(detections) {
    for (let i = 0; i < detections.length; i += 1) {
      const alignedRect = detections[i].alignedRect;
      const x = alignedRect._box._x;
      const y = alignedRect._box._y;
      const boxWidth = alignedRect._box._width;
      const boxHeight = alignedRect._box._height;

      ctx.beginPath();
      ctx.rect(x, y, boxWidth, boxHeight);
      ctx.strokeStyle = '#a15ffb';
      ctx.stroke();
      ctx.closePath();
    }
  }

  function drawLandmarks(detections) {
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

  function drawPart(feature, closed) {
    ctx.beginPath();
    for (let i = 0; i < feature.length; i += 1) {
      const x = feature[i]._x;
      const y = feature[i]._y;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    if (closed === true) {
      ctx.closePath();
    }
    ctx.stroke();
  }

  // Helper Functions
  async function getVideo() {
    // Grab elements, create settings, etc.
    const videoElement = document.createElement('video');
    videoElement.setAttribute('style', 'display: none;');
    videoElement.width = width;
    videoElement.height = height;
    document.getElementById('video-container').appendChild(videoElement);

    // Create a webcam capture
    const capture = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    videoElement.srcObject = capture;
    videoElement.play();

    return videoElement;
  }

  function createCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    document.getElementById('video-container').appendChild(canvas);
    return canvas;
  }

  //

  function loadMobileNet(emotions) {
    setInitializing(false);

    if (mobilenet.current == null) {
      mobilenet.current = ml5.featureExtractor(
        'MobileNet',
        {
          numLabels: emotions.length,
        },
        () => {
          console.log('MobileNet input video ready!');
        }
      );
    }

    classifier.current = mobilenet.current.classification(video.current, () => {
      let progress = 0;

      let trainable = emotions.length >= 2;

      emotions.forEach((emotion) => {
        if (emotion.numberOfSamples == 0) {
          trainable = false;
          return;
        }
      });

      if (trainable) {
        classifier.current.train((loss) => {
          if (loss === null) {
            classifier.current.classify();
          } else {
            progress = p5.lerp(progress, 100, 0.2);
            setTrainingProgress(progress);
          }
        });
      }
    });
  }

  //

  return (
    <div>
      <Paper
        variant="outlined"
        classes={{
          root: classes.leftContainer,
        }}
      >
        <div id="video-container" className={classes.videoContainer}></div>
        <FormControlLabel
          value={showLandmarks.current}
          control={
            <Checkbox
              color="primary"
              onChange={(event) =>
                (showLandmarks.current = event.target.checked)
              }
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
                value={emotion.probability}
                label={emotion.name}
                barColor={emotion.color}
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
        <EmotionInput onButtonClick={handleNewEmotion} enable={initializing} />
        <Paper className={classes.emotionListContainer}>
          {emotions.map(({ name, numberOfSamples, color }, index) => {
            return (
              <EmotionInfo
                deleteEnabled={initializing}
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
          <Button
            disabled={emotions.length < 2}
            variant="contained"
            color="primary"
            onClick={() => loadMobileNet(emotions)}
          >
            Entrenar modelo
          </Button>
          <LinearProgressWithLabel value={trainingProgress} />
        </Paper>
      </Paper>
    </div>
  );
});

export default EmotionRecognition;
