const { createCanvas } = require('canvas');

function createPlaceholder(width, height, bgColor = '#CCCCCC', textColor = '#969696', text = null) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (!text) {
        text = `${width} x ${height}`;
    }

    let fontSize = Math.min(width / 10, height / 10);
    ctx.font = `${fontSize}px sans-serif`;

    ctx.fillText(text, width / 2, height / 2);

    return canvas.toBuffer();
}

module.exports = createPlaceholder;