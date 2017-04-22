import { div } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import Keyboard from './components/Keyboard';
import Oscillator from './components/Oscillator';
import Filter from './components/Filter';

function keyToNote(keySource$) {
  const baseNote = 3; // 0 = A, 3 = C
  const keyboardLayout = 'awsedftgyhujk';

  return keySource$
    .map(evt => evt.key)
    .map(key => keyboardLayout.indexOf(key))
    .filter(note => note !== -1)
    .map(note => note + baseNote);
}

function collectActiveNotes(activeNotes, { add, note }) {
  if (add && !activeNotes.includes(note)) {
    return [...activeNotes, note];
  }

  return activeNotes.filter(s => s !== note);
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
        octave: 0,
        label: `osc-${id}`
      })
    })
  ));
  const filter = Filter({
    DOM: sources.DOM,
    props: xs.of({
      filterType: 'bandpass',
      frequency: 2000,
      Q: 1,
      legend: 'filter'
    })
  });

  const play$ = xs.merge(
    keyboard.play,
    sources.DOM.select('body').events('keydown').compose(keyToNote)
  ).map(note => ({ add: true, note }));

  const stop$ = xs.merge(
    keyboard.stop,
    sources.DOM.select('body').events('keyup').compose(keyToNote)
  ).map(note => ({ remove: true, note }));

  const notes$ = xs.merge(play$, stop$).fold(collectActiveNotes, []);

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
          div([
            ...oscillatorDOMs.map(o => div('.oscillator', o)),
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
