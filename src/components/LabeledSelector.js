import { div, option, label, select } from '@cycle/dom';

export default function LabeledSelector(sources) {
  const value$ = sources.DOM.select('.selector').events('change')
        .map(e => e.target.value);

  const state$ = sources.props
        .map(props => value$
                 .map(value => ({
                   labeltext: props.labeltext,
                   options: props.options,
                   value
                 }))
                 .startWith(props)
            )
        .flatten()
        .remember();

      console.log({state$})
  const vdom$ = state$
        .map(({ value, options, labeltext }) =>
             div('.labeled-selector', [
               label(labeltext),
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
