import { useRef, useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
//import { load } from "@tensorflow-models/facemesh";
import { load, SupportedPackages } from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { draw } from "../utils";
import styled from "styled-components";

const Container = styled.span`
    display: inline-flex;
    align-items: center;
    width: 150px;
    max-width: 150px;
    padding: 4px 12px;
    border: 1px solid #bfc9d9;
    border-radius: 4px;

    input[type="color"] {
        margin-right: 8px;
        -webkit-appearance: none;
        border: none;
        width: auto;
        height: auto;
        cursor: pointer;
        background: none;
        &::-webkit-color-swatch-wrapper {
        padding: 0;
        width: 14px;
        height: 14px;
        }
        &::-webkit-color-swatch {
        border: 1px solid #bfc9d9;
        border-radius: 4px;
        padding: 0;
        }
    }

    input[type="text"] {
        border: none;
        width: 100%;
        font-size: 14px;
    }
`;

const useStyles = makeStyles(theme => ({
    header: {
        height: "80px",
        display: "table",
        textAlign: 'center',
        width: "100%"
    },
    title: {
        display:  "table-cell",
        verticalAlign: "middle",
        fontSize: "30px",
        fontWeight: 'bold'
    } ,
    card: {
        maxWidth: 200
    },
    camera: {
    }
}))

const FaceMask = (props) => {
    const classes = useStyles();
    const webcam = useRef(null);
    const canvas = useRef(null);
    const colorState = useRef("#FFFFFF");
    const handleInput = e => {
        colorState.current = e.target.value;
    };
    useEffect(() => {
        
        const faceDetector = async () => {
            const model = await load(
                SupportedPackages.mediapipeFacemesh
                );
            detect(model);
            };
        faceDetector();
        
        const detect = async (model) => {
            if (!webcam.current || !canvas.current) return;
            const webcamCurrent = webcam.current;
            if (webcamCurrent.video.readyState !== 4)
            detect(model);
            
        const video = webcamCurrent.video;
        const videoWidth = webcamCurrent.video.videoWidth;
        const videoHeight = webcamCurrent.video.videoHeight;
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;
        const predictions = await model.estimateFaces({
            input: video
        });
        if(canvas.current!==null) {
            const ctx = canvas.current.getContext("2d");
            requestAnimationFrame(() => {
                draw(predictions, ctx, videoWidth, videoHeight,colorState.current);
            });
        }
        detect(model);
    };
    },[]);
    
    return (
        <div className="{classes.root}">
            <header className={classes.header}>
                <div className={classes.title}>Seguimiento de rostro en tiempo real aplicado a la creación de máscaras</div>
            </header>
            <div className = {classes.card}>
                <Card>
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Elige un color para tu mascara
                    </Typography>
                    </CardContent>
                    <CardContent>
                    <div className="{classes.picker}">
                    <div className={classes.root}>
                        <Container>
                            <input type="color" onChange={handleInput} value={colorState.current}/>
                            <input type="text" onChange={handleInput} value={colorState.current} />
                        </Container>
                        </div>
                    </div>
                    </CardContent>
                </Card>

            </div>
            <div className={classes.camera}>
                <Webcam
                    audio={false}
                    ref={webcam}
                    style={{
                    position: "absolute",
                    textAlign: "center",
                    margin: 'auto',
                    top: 100,
                    left: 0,
                    right: 0,
                    zIndex: 1
                    }}
                />
                <canvas
                    ref={canvas}
                    style={{
                    position: "absolute",
                    textAlign: "center",
                    margin: 'auto',
                    top: 100,
                    left: 0,
                    right: 0,
                    zIndex: 2
                    }}
                />
            </div>
        </div>
    );
};
export default FaceMask;