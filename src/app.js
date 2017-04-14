import { button, div, li, ul } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import { log, toHertz } from './utils';
import Keyboard from './components/Keyboard';
import Oscillator from './components/Oscillator';

function keyToSteps(keySource$) {
  const baseStep = 3; // 0 = A, 3 = C
  const keyboardLayout = 'awsedftgyhujk';

  return keySource$
    .map(evt => evt.key)
    .map(key => keyboardLayout.indexOf(key))
    .filter(step => step !== -1)
    .map(step => step + baseStep);
}

export function App(sources) {
  const keyboard = Keyboard({
    DOM: sources.DOM,
    playingNotes: sources.Audio.notes
  });
  const oscillators = [1, 2, 3].map(id => (
    isolate(Oscillator)({
      DOM: sources.DOM,
      props: xs.of({
        waveform: 'square',
        detune: 0,
        gain: 0.5,
        label: `osc-${id}`
      })
    })
  ));

  const play$ = xs.merge(
    keyboard.play,
    sources.DOM.select('body').events('keydown').compose(keyToSteps),
  ).map(step => ({ add: true, step }));

  const stop$ = xs.merge(
    keyboard.stop,
    sources.DOM.select('body').events('keyup').compose(keyToSteps),
  ).map(step => ({ remove: true, step }))

  const notes$ = xs
        .merge(play$, stop$)
        .fold((activeSteps, { add, step }) => add && !activeSteps.includes(step) ? [...activeSteps, step] : activeSteps.filter(s => s !== step), []);

  const instructions$ = xs.merge(
    ...oscillators.map((o, idx) => o.value.map(oscillatorValues => ({
      type: 'oscillator',
      payload: oscillatorValues
    }))),
    notes$.map(notes => ({
      type: 'notes',
      payload: { value: notes }
    }))
  );

  const vdom$ = xs.combine(keyboard.DOM, ...oscillators.map(o => o.DOM))
        .map(([keyboardDOM, ...oscillatorDOMs]) => (
          div('.synth', [
            div('.synth-oscillators', oscillatorDOMs),
            keyboardDOM
          ])));

  return {
    DOM: vdom$,
    Audio: instructions$
  };
}
