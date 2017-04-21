import sampleCombine from 'xstream/extra/sampleCombine';
import { diff, toHertz } from '../utils';

function createOscillator(audioContext, destination, note) {
  return (config) => {
    const gainNode = createGain(audioContext)(config);
    const oscillator = audioContext.createOscillator();

    oscillator.type = config.waveform;
    oscillator.detune.value = config.detune;
    oscillator.frequency.value = toHertz(440)(note - 12);

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
  };
}

function connectNodes(...nodes) {
  return nodes.reverse().reduce((node1, node2) => {
    node2.connect(node1);
    return node2;
  });
}

const WebAudioDriver = audioContext => {
  const runningOscillators = {};

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const timeDomainData = new Uint8Array(analyser.frequencyBinCount);

  const destinationNode = connectNodes(filter, analyser, audioContext.destination);

  return (instructions$) => {
    const oscillatorSettings$ = instructions$
      .filter(x => x.type === 'oscillator')
      .map(x => x.payload)
      .fold((oscillators, oscillator) => Object.assign({}, oscillators, {
        [oscillator.label]: oscillator
      }));

    const notes$ = instructions$
          .filter(x => x.type === 'notes')
          .map(x => x.payload);

    const filter$ = instructions$
          .filter(x => x.type === 'filter')
          .map(x => x.payload);

    const tick$ = instructions$
          .filter(x => x.type === 'tick');

    filter$.subscribe({
      next: ({ frequency, Q }) => {
        filter.frequency.value = frequency;
        filter.Q.value = Q;
      },
      error: e => console.log(e) // eslint-disable-line
    });

    const oscillators$ = notes$
      .compose(sampleCombine(oscillatorSettings$));

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
                  .map(createOscillator(audioContext, destinationNode, note));

            oscillators.forEach(o => o.start());
            runningOscillators[note] = oscillators;
          });
        },
          error: e => console.log(e.code) // eslint-disable-line
      });

    return {
      notes: notes$.map(n => n.value),
      oscillatorSettings: oscillatorSettings$,
      timeDomainData: tick$.map(() => {
        analyser.getByteTimeDomainData(timeDomainData);
        return timeDomainData;
      })
    };
  };
};


export function makeWebAudioDriver(audioContext = new AudioContext()) {
  return WebAudioDriver(audioContext);
}
