import { adapt } from '@cycle/run/lib/adapt';
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { diff, toHertz } from '../utils';

function createOscillator(audioContext, destination, note) {
  return (config) => {
    const gainNode = createGain(audioContext)(config);
    const oscillator = audioContext.createOscillator();

    oscillator.type = config.waveform;
    oscillator.detune.value = config.detune;
    oscillator.frequency.value = toHertz(440)(note);

    oscillator.connect(gainNode);
    gainNode.connect(destination);

    return oscillator;
  };
}

function createGain(audioContext) {
  return ({ gain }) => {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    return gainNode;
  }
}

const WebAudioDriver = audioContext => {
  const runningOscillators = {};

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.connect(audioContext.destination);

  return (instructions$) => {
    const oscillatorSettings$ = instructions$
      .filter(x => x.type === 'oscillator')
      .map(x => x.payload)
      .fold((oscillators, oscillator) => Object.assign({}, oscillators, {
        [oscillator.label]: oscillator
      }));

    const notes$ = instructions$
      .filter(x => x.type === 'notes')
          .map(x => x.payload)

    const filter$ = instructions$
          .filter(x => x.type === 'filter')
          .map(x => x.payload);

    filter$.debug().subscribe({
      next: ({ frequency, Q }) => {
        filter.frequency.value = frequency;
        filter.Q.value = Q;
      },
      error: e => console.log(e)
    });

    const oscillators$ = notes$
      .compose(sampleCombine(oscillatorSettings$))

    oscillators$
      .subscribe({
        next: ([notes, oscillatorSettings]) => {
          const currNotes = notes.value;
          const prevNotes = Object.keys(runningOscillators).map(x => parseInt(x));
          const [toStop, toStart] = diff(prevNotes, currNotes);

          toStop.forEach(note => {
            runningOscillators[note].map(o => o.stop());
            delete runningOscillators[note];
          });

          toStart.forEach(note => {
            const oscillators = Object.keys(oscillatorSettings)
                  .map(key => oscillatorSettings[key])
                  .map(createOscillator(audioContext, filter, note));

            oscillators.forEach(o => o.start());
            runningOscillators[note] = oscillators;
          });
        },
        error: e => console.log(e.code)
      });

    return {
      notes: notes$.map(n => n.value),
      oscillatorSettings: oscillatorSettings$
    }
  }
};


export function makeWebAudioDriver(audioContext = new AudioContext()) {
  return WebAudioDriver(audioContext);
}
