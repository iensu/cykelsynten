import {div, button, li, ul} from '@cycle/dom'
import xs from 'xstream'

const F0 = 440; // A

const START_STEP = 3; // C

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

const keyboardKeys = 'awsedftgyhujk';

const audioContext = new AudioContext();

const semitoneSteps = range(START_STEP, START_STEP + 12);

function renderKey(step) {
  const note = NOTE_STRINGS[step % 12];
  const cssClass = note.match(/[b#]$/) ? '.sharp' : '';
  return li(cssClass, button('.key', { attrs: { id: step } }, note))
}

export function App (sources) {
  const click$ = sources.DOM.select('.key')
        .events('click')
        .map(evt => evt.target.id);
  const keydown$ = sources.DOM.select('body').events('keydown')
        .map(evt => keyboardKeys.indexOf(evt.key))
        .filter(i => i !== -1)
        .map(index => semitoneSteps[index])

  const vtree$ = xs.merge(keydown$, click$)
          .map(playNote).startWith(null)
          .map(() => ul(semitoneSteps.map(renderKey)));

  const sinks = {
    DOM: vtree$
  }

  return sinks
}

// HELPER FUNCTIONS

function playNote(semitoneStep) {
  const note = toHertz(semitoneStep);
  const osc = audioContext.createOscillator();
  osc.frequency.value = note;
  osc.connect(audioContext.destination);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 1);
}

function range(start, end) {
  return Array.from(new Array(end - start), (_, idx) => idx + start);
}

function toHertz(semitoneStep) {
  const a = 2 ** (1/12);
  return F0 * (a ** semitoneStep);
}
