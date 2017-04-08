import {div, span } from '@cycle/dom'
import isolate from '@cycle/isolate';
import Rx from 'rxjs/Rx';
import { waveforms } from '../constants';
import LabeledSlider from './LabeledSlider';
import LabeledSelector from './LabeledSelector';

export default function Oscillator(sources) {
  const Waveform = isolate(LabeledSelector);
  const Gain = isolate(LabeledSlider);
  const Detune = isolate(LabeledSlider);

  const controls$ = sources.props
        .map(({ waveform, detune, gain }) => [
          Waveform({
            DOM: sources.DOM,
            props: Rx.Observable.of({ label: 'Waveform', options: waveforms, value: waveform })
          }),
          Gain({
            DOM: sources.DOM,
            props: Rx.Observable.of({ label: 'Gain', min: 0, max: 1, step: 0.01, value: gain })
          }),
          Detune({
            DOM: sources.DOM,
            props: Rx.Observable.of({ label: 'Detune', min: -100, max: 100, step: 1, value: detune })
          })
        ]);

  const value$ = controls$
        .flatMap(controls => Rx.Observable.combineLatest(sources.props, ...controls.map(c => c.value)))
        .map(([props, waveform, gain, detune]) => ({
          label: props.label, waveform, gain, detune
        }))
        .publishReplay(1).refCount();

  const vdom$ = controls$.
        flatMap(controls => Rx.Observable.combineLatest(sources.props, ...controls.map(c => c.DOM)))
        .map(([props, ...controlsVdom]) => (
          div('.oscillator', [
            span('.label', props.label),
            div('.oscillator-controls', controlsVdom)
          ])
        ));

  return {
    DOM: vdom$,
    value: value$
  };
}
