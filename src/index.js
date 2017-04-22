import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import {timeDriver} from '@cycle/time';
import {App} from './app';
import {makeWebAudioDriver} from './drivers/webAudioDriver';
import {makeAudioCanvasDriver} from './drivers/audioCanvasDriver';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const main = App;

const drivers = {
  DOM: makeDOMDriver('#app'),
  Audio: makeWebAudioDriver(audioContext),
  Time: timeDriver,
  Canvas: makeAudioCanvasDriver('audio-canvas', 200, 170)
};

run(main, drivers);
