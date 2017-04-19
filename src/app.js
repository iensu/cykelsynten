import { div } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import Keyboard from './components/Keyboard';
import Oscillator from './components/Oscillator';
import Filter from './components/Filter';

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
  const oscillators = [1, 2].map(id => (
    isolate(Oscillator)({
      DOM: sources.DOM,
      props: xs.of({
        waveform: 'sine',
        detune: 0,
        gain: 0.3,
        label: `osc-${id}`
      })
    })
  ));
  const filter = Filter({
    DOM: sources.DOM,
    props: xs.of({
      filterType: 'bandpass',
      frequency: 5000,
      Q: 1
    })
  });

  const play$ = xs.merge(
    keyboard.play,
    sources.DOM.select('body').events('keydown').compose(keyToSteps)
  ).map(step => ({ add: true, step }));

  const stop$ = xs.merge(
    keyboard.stop,
    sources.DOM.select('body').events('keyup').compose(keyToSteps)
  ).map(step => ({ remove: true, step }));

  const notes$ = xs
        .merge(play$, stop$)
        .fold((activeSteps, { add, step }) => add && !activeSteps.includes(step) ? [...activeSteps, step] : activeSteps.filter(s => s !== step), []);

  const instructions$ = xs.merge(
    ...oscillators.map(o => o.value.map(oscillatorValues => ({
      type: 'oscillator',
      payload: oscillatorValues
    }))),
    notes$.map(notes => ({
      type: 'notes',
      payload: { value: notes }
    })),
    filter.value.map(filterValues => ({
      type: 'filter',
      payload: filterValues
    })),
    sources.RAF.map(timestamp => ({
      type: 'tick',
      payload: timestamp
    }))
  );

  const vdom$ = xs.combine(keyboard.DOM, filter.DOM, ...oscillators.map(o => o.DOM))
        .map(([keyboardDOM, filterDOM, ...oscillatorDOMs]) => (
          div('.synth', [
            div('.synth-oscillators', oscillatorDOMs),
            div('.keyboard-wrapper', [
              filterDOM,
              keyboardDOM
            ]),
          ])));

  return {
    DOM: vdom$,
    Audio: instructions$,
    Canvas: sources.Audio.timeDomainData
  };
}
