import {div, button, input, label, li, option, select, ul} from '@cycle/dom'
import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'

const F0 = 440; // A

const OSCILLATOR_COUNT = 3;

const START_STEP = 3; // C

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

const WAVEFORMS = ['sawtooth', 'triangle', 'square', 'sine'];

const keyboardKeys = 'awsedftgyhujk';

const audioContext = new AudioContext();

const semitoneSteps = range(START_STEP, 12);

export function App (sources) {
  const click$ = sources.DOM.select('.key')
        .events('click')
        .map(evt => evt.target.id);
  const keydown$ = sources.DOM.select('body').events('keydown')
        .map(evt => keyboardKeys.indexOf(evt.key))
        .filter(i => i !== -1)
        .map(index => semitoneSteps[index])

  const note$ = xs.merge(keydown$, click$).map(toHertz);

  const oscillators$ = xs.combine(
    ...range(1, 3)
      .map(id => sources.DOM.select(`#oscillator-${id}`))
      .map(createOscillatorControlStream)
  );

  const vtree$ = note$.compose(sampleCombine(oscillators$))
        .map(playNote).startWith(null)
        .map(() =>
             div([
               div('.oscillators', range(1, 3).map(renderOscillator)),
               ul(semitoneSteps.map(renderKey))
             ])
            );

  const sinks = {
    DOM: vtree$
  }

  return sinks
}

// HELPER FUNCTIONS

function createOscillatorControlStream(source) {
  const waveform$ = source.select('.oscillator-controls__waveform').events('change')
        .map(e => e.target.value)
        .startWith(WAVEFORMS[0]);
  const gain$ = source.select('.oscillator-controls__gain').events('click')
        .map(e => e.target.value)
        .startWith(0.5);
  const detune$ = source.select('.oscillator-controls__detune').events('click')
        .map(e => e.target.value)
        .startWith(0);
  return xs.combine(waveform$, gain$, detune$).map(([waveform, gain, detune]) => ({
    waveform,
    gain,
    detune
  }));
}

function playNote([frequency, oscillators]) {
  oscillators.map(({ gain, waveform, detune }) => {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNode.connect(audioContext.destination);

    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.detune.value = detune;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    return oscillator;
  }).forEach(oscillator => {
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  });
}

function range(start, count) {
  return Array.from(new Array(count), (_, idx) => idx + start);
}

function renderKey(step) {
  const note = NOTE_STRINGS[step % 12];
  const cssClass = note.match(/[b#]$/) ? '.sharp' : '';
  return li(cssClass, button('.key', { attrs: { id: step } }, note))
}

function renderOscillator(id) {

  return div('.oscillator', { attrs: { id: `oscillator-${id}` } }, [
    label('.oscillator__name', `OSC${id}`),
    div('.oscillator-controls', [
      label('Waveform'),
      select('.oscillator-controls__waveform', WAVEFORMS.map((val, idx) => option({ attrs: { value: val }}, val))),
      label('Gain'),
      input('.oscillator-controls__gain', { attrs: { type: 'range', min: 0, max: 1, step: 0.01, value: 0.5 }}),
      label('Detune'),
      input('.oscillator-controls__detune', { attrs: { type: 'range', min: -100, max: 100, step: 1, value: 0 }})
    ])
  ]);
}

function toHertz(semitoneStep) {
  const a = 2 ** (1/12);
  return F0 * (a ** semitoneStep);
}
