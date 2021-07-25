import React, { useState } from "react";
import styled from "styled-components";
import { makeStyles } from '@material-ui/core/styles';
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
    root: {
        fontFamily: theme.typography
    },
    boxDrop: {
        boxSizing: 'border-box',
        color: theme.palette.primary
    }
}));

const ColorPicker = (props) => {
    return (
        <Container>
        <input type="color" value={props.value} {...props} />
        <input type="text" value={props.value} {...props}/>
        </Container>
    );
};

const ColorPickerLayout = ({handleInput,color}) => {
    
    const classes = useStyles();
    // const [colorState,updateState] = useState(color);
    console.log('color :>> ', color);
    return (
        <div className={classes.root}>
        <ColorPicker onChange={handleInput} value={color} />
        </div>
    );
}
export default ColorPickerLayout;