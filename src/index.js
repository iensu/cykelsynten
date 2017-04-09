import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
import { makeWebAudioDriver } from './drivers/webAudioDriver';

const audioContext = new AudioContext();
const main = App

const drivers = {
  DOM: makeDOMDriver('#app'),
  Audio: makeWebAudioDriver(audioContext)
}

run(main, drivers)
