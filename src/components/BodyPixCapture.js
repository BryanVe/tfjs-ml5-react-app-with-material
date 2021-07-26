import React from 'react'
import { makeStyles, Typography } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import * as bodyPix from '@tensorflow-models/body-pix'
import { DropzoneAreaBase } from 'material-ui-dropzone';

import { handleAsyncFunctionErrors } from 'utils'
import rightArrowPng from 'assets/right_arrow.png'
// import '@tensorflow/tfjs-backend-webgl';

const ASPECT_RATIO = 4 / 3
const WIDTH = 300
const HEIGHT = WIDTH / ASPECT_RATIO
const FPS = 1000 / 30

const useStyles = makeStyles(theme => ({
  wrapper: {
    maxWidth: 900,
    position: 'relative',
    width: '90vw',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)'
  },
  title: {
    marginBottom: 40,
    textAlign: 'center'
  },
  section: {
    border: '3px dashed #00C2FF',
    borderRadius: 16
  },
  previewChip: {
    maxWidth: 240,
    marginTop: theme.spacing(3)
  },
  dropzone: props => ({
    maxWidth: WIDTH,
    maxHeight: HEIGHT,
    minHeight: HEIGHT,
    marginTop: 32,
    background: props.loadedImage.length > 0 ?
      `linear-gradient(rgba(255,255,255,.6), rgba(255,255,255,.6)), url(${props.loadedImage[0].data})` :
      '#FFF',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    '& svg, & p': {
      color: '#2a2a2a'
    }
  })
}))

const configureAndGetCapture = async (capture) => {
  if (!capture)
    return null

  capture.width = WIDTH
  capture.height = HEIGHT

  if (navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    capture.srcObject = stream
  }

  // not show the video, just the result canvas (source)
  // capture.style.display = 'none'

  return capture
}


const BodyPixCapture = () => {
  const counterRef = React.useRef(0)
  const captureRef = React.useRef(null)
  const sourceRef = React.useRef(null)
  const outputRef = React.useRef(null)
  const [loadingSource, setLoadingSource] = React.useState(true)
  const [loadingOutput, setLoadingOutput] = React.useState(true)
  const [loadedImage, setLoadedImage] = React.useState([])
  const classes = useStyles({ loadedImage })

  const handleOnAddNewFiles = (newFiles) => {
    // handle the logic in order to upload just one image
    const image = newFiles[0]
    image.name = image.file.name
    image.lastModified = image.file.lastModified

    setLoadedImage([image])
    setLoadingOutput(true)
    counterRef.current = 1
  }

  const handleOnDeleteOneFile = () => {
    setLoadedImage([])
    setLoadingOutput(true)
    counterRef.current = 0
  }

  React.useEffect(() => {
    (async () => {
      
      const [net, netError] = await handleAsyncFunctionErrors(bodyPix.load())
      if (netError || !net)
      return
      
      const [capture, captureError] = await handleAsyncFunctionErrors(configureAndGetCapture(captureRef.current))
      if (captureError || !capture)
      return
      
      const source = sourceRef.current

      if (!source)
        return
      
      const context = source.getContext('2d')

      if (!context)
        return

      // start capturing webcam input
      capture.addEventListener('play', function() {
        const $this = this;

        setLoadingSource(false);
        (function loop() {
          if (!$this.paused && !$this.ended) {
            context.drawImage($this, 0, 0, WIDTH, HEIGHT);

            (async () => {
              const segmentation = await net.estimatePersonSegmentation(source)
              const output = outputRef.current

              if (!output)
                return

              if (counterRef.current === 0) {
                const backgroundBlurAmount = 10
                const edgeBlurAmount = 12
                const flipHorizontal = false
                
                setLoadingOutput(false)
                bodyPix.drawBokehEffect(
                  output,
                  source,
                  segmentation,
                  backgroundBlurAmount,
                  edgeBlurAmount,
                  flipHorizontal
                )
              }
              else {
                // const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
                // const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
                
                // const backgroundDarkeningMask = bodyPix.toMask(
                //     segmentation, foregroundColor, backgroundColor);
                const backgroundDarkeningMask = bodyPix.toMaskImageData(segmentation, true);
                const opacity = 1;
                const maskBlurAmount = 3;
                const flipHorizontal = false;
                bodyPix.drawMask(
                  output, source, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
                const outputContext = output.getContext('2d')
                const canvasImage = outputContext.getImageData(0, 0, WIDTH, HEIGHT)
                
                for (let i = 0; i < canvasImage.data.length; i+=4) {
                  if (canvasImage.data[i] === 0 && canvasImage.data[i + 1] === 0 && canvasImage.data[i + 2] === 0) {
                    canvasImage.data[i + 3] = 0
                  }
                }
                
                setLoadingOutput(false)
                outputContext.putImageData(canvasImage, 0, 0)
              }
            })()

            setTimeout(loop, FPS)
          }
        })()
      }, false)
    })();

  }, [loadingOutput])

  return (
    <>
      <video ref={ref => captureRef.current = ref} autoPlay hidden></video>
      <div className={classes.wrapper}>
        <div className={classes.title}>
          <Typography variant='h1'>Modificación de fondo</Typography>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ padding: 32, border: '4px dashed #6877C8', display: 'flex', flexDirection: 'column', borderRadius: 16 }}>
            <>
              <canvas ref={sourceRef} width={WIDTH} height={HEIGHT} style={{ display: loadingSource ? 'none' : 'unset', backgroundColor: 'transparent'}} />
              { loadingSource && <Skeleton variant='rect' animation='wave' width={WIDTH} height={HEIGHT} /> }
            </>
            <DropzoneAreaBase
              fileObjects={loadedImage}
              dropzoneClass={classes.dropzone}
              dropzoneText='Sube una imagen para el fondo'
              acceptedFiles={['.png', '.jpg', '.jpeg']}
              filesLimit={1}
              showPreviews={false}
              useChipsForPreview={false}
              showPreviewsInDropzone={false}
              previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
              previewChipProps={{ classes: { root: classes.previewChip } }}
              previewText=''
              showFileNamesInPreview={false}
              onAdd={handleOnAddNewFiles}
              onDelete={handleOnDeleteOneFile}
              getFileAddedMessage={fileName => `Imagen ${fileName} cargada`}
              getFileRemovedMessage={fileName => `Imagen ${fileName} removida`}
              getFileLimitExceedMessage={() => `Solo puedes cargar una imagen a la vez`}
              getDropRejectMessage={() => `No se pudo cargar la imagen`}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <img alt='right_arrow_result' src={rightArrowPng} style={{ width: 60, height: 60, pointerEvents: 'none', userSelect: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ border: '4px dashed #6877C8', padding: 32, borderRadius: 16 }}>
              <div style={{ position: 'relative' }}>
                {
                  loadingOutput ?
                  <Skeleton variant='rect' animation='wave' width={WIDTH} height={HEIGHT} /> :
                  (counterRef.current !== 0 ? <img
                    alt='background'
                    src={loadedImage[0].data}
                    width={WIDTH}
                    height={HEIGHT}
                    style={{ objectFit: 'cover', position: 'absolute', left: 0, zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}
                  /> : null)
                }
                <canvas ref={outputRef} width={WIDTH} height={HEIGHT} style={{ position: 'relative', display: loadingOutput ? 'none' : 'unset', zIndex: 1000 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BodyPixCapture
