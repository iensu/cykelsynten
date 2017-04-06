import {div, button, input, label, li, option, select, ul} from '@cycle/dom'
import xs from 'xstream'

function handleEvent(selector, event, fn = e => e.target.value) {
  return (domSource$) => domSource$.select(selector).events(event).map(fn);
}

export default function Oscillator(sources) {

  const waveform$ = sources.DOM.compose(handleEvent('.oscillator-controls__waveform', 'change'));
  const gain$ = sources.DOM.compose(handleEvent('.oscillator-controls__gain', 'click'));
  const detune$ = sources.DOM.compose(handleEvent('.oscillator-controls__detune', 'click'));

  const value$ = xs.combine(waveform$, gain$, detune$)
        .map(([ waveform, gain, detune ]) => ({
          waveform, gain, detune
        }));

  const state$ = sources.props
        .map(props => value$.startWith(props)).flatten();

  const vdom$ = state$.map(({ waveform, gain, detune }) => (
    div('.oscillator',
      div('.oscillator-controls', [
        label('Waveform'),
        select('.oscillator-controls__waveform', WAVEFORMS.map((val, idx) => option({ attrs: { value: waveform }}, val))),
        label('Gain'),
        input('.oscillator-controls__gain', { attrs: { type: 'range', min: 0, max: 1, step: 0.01, value: gain }}),
        label('Detune'),
        input('.oscillator-controls__detune', { attrs: { type: 'range', min: -100, max: 100, step: 1, value: detune }})
      ])
    )
  ));

  const sinks = {
    DOM: vdom$,
    value: value$
  };

  return sinks;
}
