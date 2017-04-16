import {div, span, fieldset, legend, label } from '@cycle/dom'
import isolate from '@cycle/isolate';
import xs from 'xstream';
import LabeledSlider from './LabeledSlider';

export default function Filter(sources) {
  const props$ = sources.props.remember();
  const Frequency = isolate(LabeledSlider);
  const Quality = isolate(LabeledSlider);

  const controls$ = props$
        .map(({ frequency, Q }) => [
          Frequency({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Frequency', min: 0, max: 5000, step: 1, value: frequency })
          }),
          Quality({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Quality', min: -5, max: 5, step: 0.01, value: Q })
          })
        ]);

  const value$ = controls$
        .map(controls => xs.combine(props$, ...controls.map(c => c.value)))
        .flatten()
        .map(([props, frequency, Q]) => ({ filterType: props.filterType, frequency, Q }))
        .remember();

  const vdom$ = controls$
        .map(controls => xs.combine(props$, ...controls.map(c => c.DOM)))
        .flatten()
        .map(([props, ...controlsVdom]) => (
          fieldset('.filter', [
            legend('.label', props.label),
            div('.filter-controls', controlsVdom)
          ])
        ));

  return {
    DOM: vdom$,
    value: value$
  };
}
