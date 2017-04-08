import { button, div, li, ul } from '@cycle/dom';
import isolate from '@cycle/isolate';
import Rx from 'rxjs/Rx';
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
  const keyboard = Keyboard({ DOM: sources.DOM });
  const oscillators = [1, 2, 3].map(id => (
    isolate(Oscillator)({
      DOM: sources.DOM,
      props: Rx.Observable.of({
        waveform: 'square',
        detune: 0,
        gain: 0.5,
        label: `osc-${id}`
      })
    })
  ));

  const play$ = Rx.Observable.merge(
    keyboard.value,
    keyToSteps(sources.DOM.select('body').events('keydown'))
  );

  const stop$ = keyToSteps(sources.DOM.select('body').events('keyup'));

  const instructions$ = Rx.Observable.merge(
    play$.map(toHertz(440)).map(frequency => ({
      type: 'frequency',
      payload: { value: frequency, start: true }
    })),
    stop$.map(toHertz(440)).map(frequency => ({
      type: 'frequency',
      payload: { value: frequency, stop: true }
    })),
    ...oscillators.map((o, idx) => o.value.map(oscillatorValues => ({
      type: `oscillator-${idx + 1}`,
      payload: oscillatorValues
    })))
  );

  const vdom$ = Rx.Observable.combineLatest(keyboard.DOM, ...oscillators.map(o => o.DOM))
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
