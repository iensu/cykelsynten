import xs from 'xstream';

let rafId;

export default function RequestAnimationFrameDriver() {
  function tick(cb) {
    return (timestamp) => {
      cb(timestamp);
      rafId = window.requestAnimationFrame(tick(cb));
    };
  }

  const producer = {
    start: (listener) => {
      rafId = window.requestAnimationFrame(tick(timestamp => listener.next(timestamp)));
    },
    stop: () => {
      window.cancelAnimationFrame(rafId);
    }
  };

  return xs.create(producer);
}
