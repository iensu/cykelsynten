import {div, span, fieldset, legend, label } from '@cycle/dom'
import isolate from '@cycle/isolate';
import xs from 'xstream';
import { waveforms } from '../constants';
import LabeledSlider from './LabeledSlider';
import LabeledSelector from './LabeledSelector';

export default function Oscillator(sources) {
  const props$ = sources.props.remember();
  const Waveform = isolate(LabeledSelector);
  const Gain = isolate(LabeledSlider);
  const Detune = isolate(LabeledSlider);

  const controls$ = props$
        .map(({ waveform, detune, gain }) => [
          Waveform({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Waveform', options: waveforms, value: waveform })
          }),
          Gain({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Gain', min: 0, max: 1, step: 0.01, value: gain })
          }),
          Detune({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Detune', min: -100, max: 100, step: 1, value: detune })
          })
        ]);

  const value$ = controls$
        .map(controls => xs.combine(props$, ...controls.map(c => c.value)))
        .flatten()
        .map(([props, waveform, gain, detune]) => ({
          labeltext: props.labeltext, waveform, gain, detune
        }))
        .remember();

  const vdom$ = controls$
        .debug()
        .map(controls => xs.combine(props$, ...controls.map(c => c.DOM)))
        .flatten()
        .map(([props, ...controlsVdom]) => (
          fieldset('.oscillator', [
            legend('.label', props.label),
            div('.oscillator-controls', controlsVdom)
          ])
        ));

  return {
    DOM: vdom$,
    value: value$
  };
}
