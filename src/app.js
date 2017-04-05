import {div, button, li, ul} from '@cycle/dom'
import xs from 'xstream'

const semitoneSteps = [
  { step:  3, note:  'C' },
  { step:  4, note: 'C#' },
  { step:  5, note:  'D' },
  { step:  6, note: 'Eb' },
  { step:  7, note:  'E' },
  { step:  8, note:  'F' },
  { step:  9, note: 'F#' },
  { step: 10, note:  'G' },
  { step: 11, note: 'G#' },
  { step: 12, note:  'A' },
  { step: 13, note: 'Bb' },
  { step: 14, note:  'B' },
  { step: 15, note:  'C' }
]

const audioContext = new AudioContext();

const toHertz = f0 => semitoneStep => {
  const a = Math.pow(2, 1/12);
  return f0 * Math.pow(a, semitoneStep);
}

const playNote = (semitoneStep) => {
  const note = toHertz(440)(semitoneStep);
  const osc = audioContext.createOscillator();
  osc.frequency.value = note;
  osc.connect(audioContext.destination);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 1);
}

const clickStream = (sources) => (select, valueFn) => sources.DOM.select(select).events('click').map(valueFn);

const semitoneKeys = 'awsedftgyhujk';

const key = ({ step, note, sharp }) =>
      li(note.match(/[b#]$/) ? '.sharp' : '',
        button(`.key`, { attrs: { id: step, value: step } }, note)
      )

export function App (sources) {
  const click$ = sources.DOM.select('.key')
        .events('click')
        .map(evt => evt.target.value);
  const keydown$ = sources.DOM.select('body').events('keydown')
        .map(evt => semitoneKeys.indexOf(evt.key))
        .filter(i => i !== -1)
        .map(index => semitoneSteps[index].step)

  const vtree$ = xs.merge(keydown$, click$).map(playNote).startWith(null)
        .map(() => ul(semitoneSteps.map(key)));

  const sinks = {
    DOM: vtree$
  }

  return sinks
}
