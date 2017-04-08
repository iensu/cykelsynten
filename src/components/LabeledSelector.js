import { div, option, select, span } from '@cycle/dom';

export default function LabeledSelector(sources) {
  const value$ = sources.DOM.select('.selector').events('change')
        .map(e => e.target.value);

  const state$ = sources.props
        .flatMap(props => value$
                 .map(value => ({
                   label: props.label,
                   options: props.options,
                   value
                 }))
                 .startWith(props)
                )
        .publishReplay(1).refCount();

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
