import { div, label, input } from '@cycle/dom';

export default function LabeledSlider(sources) {
  const value$ = sources.DOM.select('.slider').events('change')
        .map(e => e.target.value)
        .map(parseFloat);

  const state$ = sources.props
        .map(props => value$
                 .map(value => ({
                   labeltext: props.labeltext,
                   min: props.min,
                   max: props.max,
                   step: props.step,
                   value
                 }))
                 .startWith(props)
                )
        .flatten()
        .remember();

  const id = Math.random().toString(36).slice(2);
  const vdom$ = state$
        .map(({ value, labeltext, min, max, step }) =>
             div('.labeled-slider', [
               label('.label', { attrs: { for: `${id}`}}, labeltext),
               input('.slider', { attrs: { id: `${id}`, type: 'range', min, max, step, value } })
             ])
            );

  return {
    DOM: vdom$,
    value: state$.map(({ value }) => value)
  };
}
