import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import {App} from './app';
import { makeWebAudioDriver } from './drivers/webAudioDriver';
import { makeRAFDriver } from './drivers/requestAnimationFrameDriver';
import { makeAudioCanvasDriver } from './drivers/audioCanvasDriver';

const audioContext = new AudioContext();
const main = App;

const drivers = {
  DOM: makeDOMDriver('#app'),
  Audio: makeWebAudioDriver(audioContext),
  RAF: makeRAFDriver(),
  Canvas: makeAudioCanvasDriver('audio-canvas', 200, 170)
};

run(main, drivers);
