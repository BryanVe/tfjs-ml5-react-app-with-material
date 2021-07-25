
const drawMask = ( ctx, keypoints, distance) => {
    const points = [
        93,
        132,
        58,
        172,
        136,
        150,
        149,
        176,
        148,
        152,
        377,
        400,
        378,
        379,
        365,
        397,
        288,
        361,
        323,
    ];

    ctx.moveTo(keypoints[195][0], keypoints[195][1]);
    for (let i = 0; i < points.length; i++) {
        if (i < points.length / 2) {
        ctx.lineTo(
            keypoints[points[i]][0] - distance,
            keypoints[points[i]][1] + distance
        );
        } else {
        ctx.lineTo(
            keypoints[points[i]][0] + distance,
            keypoints[points[i]][1] + distance
        );
        }
    }
};

export const draw = (predictions, ctx, width, height, color) => {
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
        const keypoints = prediction.scaledMesh;
        const boundingBox = prediction.boundingBox;
        // console.log(boundingBox);
        const bottomRight = boundingBox.bottomRight;
        const topLeft = boundingBox.topLeft;
        const distance =
            Math.sqrt(
            Math.pow(bottomRight[0] - topLeft[0], 2) +
                Math.pow(topLeft[1] - topLeft[1], 2)
            ) * 0.02;
        ctx.clearRect(0, 0, width, height);
        /*
        const img=new Image();
        img.src = "http://1.bp.blogspot.com/-qmhbJFe-mOc/Tz6-vtQlFTI/AAAAAAAAGdQ/E0lvpQTnKl4/w1200-h630-p-k-nu/fondos-vintage-flores.jpg";
        img.setAttribute('style', "display: none;"); 
        */
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        drawMask(ctx, keypoints, distance);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-in';
        /*
        ctx.drawImage(img,
            (bottomRight[0]- topLeft[0]), 
            (bottomRight[1]- topLeft[1]),
            img.width,img.height,
            topLeft[1],
            bottomRight[1],
            bottomRight[1]-topLeft[1],
            bottomRight[0]- topLeft[0]);
        
            ctx.drawImage(img,
                0, 
                0,
                width,height);
        */
        /*
        ctx.drawImage(img,
            (bottomRight[0]- width/2) as number, 
            (bottomRight[1]- height/2) as number,
            img.width,img.height,
            topLeft[0]+ width/2,
            bottomRight[1],
            topLeft[1]-bottomRight[1],
            bottomRight[1]-topLeft[1]);   
            */
            ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        });
    }
};
