import {li, button} from '@cycle/dom';

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

export default function Key(sources) {
  const value$ = sources.DOM.select('.key').events('click')
        .flatMap(() => sources.props.map(({ step }) => step))

  const vdom$ = sources.props.map(({ step }) => {
    const key = NOTE_STRINGS[step % 12];
    const cssClass = key.match(/[b#]$/) ? '.sharp' : '';

    return li(cssClass, button('.key', key))
  })

  return {
    DOM: vdom$,
    value: value$
  };
}
