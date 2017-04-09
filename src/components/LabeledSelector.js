import { div, option, select, span } from '@cycle/dom';

export default function LabeledSelector(sources) {
  const value$ = sources.DOM.select('.selector').events('change')
        .map(e => e.target.value);

  const state$ = sources.props
        .map(props => value$
                 .map(value => ({
                   label: props.label,
                   options: props.options,
                   value
                 }))
                 .startWith(props)
            )
        .flatten()
        .remember();

  const vdom$ = state$
        .map(({ value, options, label }) =>
             div('.labeled-selector', [
               span('.label', label),
               select('.selector', options.map(opt => (
                 option({ attrs: { value: opt, selected: opt === value } }, opt)
               )))
             ])
            );

  return {
    DOM: vdom$,
    value: state$.map(({ value }) => value)
  };
}
