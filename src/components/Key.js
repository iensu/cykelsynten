import {li, button} from '@cycle/dom';
import {classnames} from '../utils';

const NOTE_STRINGS = [
  'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'
];

export default function Key(sources) {
  const props$ = sources.props.remember();
  const value$ = sources.DOM.select('.key').events('click')
        .map(() => props$.map(({ step }) => step).take(1))
        .flatten();

  const vdom$ = props$.map(({ step, isPressed }) => {
    const key = NOTE_STRINGS[step % 12];
    const classes = classnames({
      '.sharp': key.match(/[b#]$/),
      '.pressed': isPressed
    });

    return li(classes, button('.key', key))
  })

  return {
    DOM: vdom$,
    value: value$
  };
}
