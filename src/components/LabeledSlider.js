import { div, input, span } from '@cycle/dom';

export default function LabeledSlider(sources) {
  const value$ = sources.DOM.select('.slider').events('change')
        .map(e => e.target.value)
        .map(parseFloat);

  const state$ = sources.props
        .map(props => value$
                 .map(value => ({
                   label: props.label,
                   min: props.min,
                   max: props.max,
                   step: props.step,
                   value
                 }))
                 .startWith(props)
                )
        .flatten()
        .remember();

  const vdom$ = state$
        .map(({ value, label, min, max, step }) =>
             div('.labeled-slider', [
               span('.label', label),
               input('.slider', { attrs: { type: 'range', min, max, step, value } })
             ])
            );

  return {
    DOM: vdom$,
    value: state$.map(({ value }) => value)
  };
}
