/*
    Censored

    Probably the best function WatermelonKatana will use. 
    We have a huge list of naughty words, and this function will censor them all.
*/

const fs = require('fs');
const naughtyWords = fs.readFileSync('naughtyWords.txt', 'utf8').split('\n');

const censored = (text) => {
    let censoredText = text;
    naughtyWords.forEach((word) => {
        censoredText = censoredText.replace(new RegExp(word, 'gi'), '****');
    });
    return censoredText;
}

module.exports = censored;
