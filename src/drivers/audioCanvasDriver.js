function AudioCanvasDriver(canvas) {
  const context = canvas.getContext('2d');
  const HEIGHT = parseInt(canvas.height);
  const WIDTH = parseInt(canvas.width);

  return (data$) => {
    data$.subscribe({
      next: (data) => {
        context.clearRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = 'rgb(30, 30, 30)';
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.lineWidth = 1;
        context.strokeStyle = 'rgb(128, 200, 0)';
        context.beginPath();

        const sliceWidth = WIDTH * 1.0 / data.length;

        for (let i = 0; i < data.length; i++) {
          const value = data[i] / 128.0;
          const y = value * HEIGHT / 2;
          const x = sliceWidth * i;

          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.lineTo(WIDTH, HEIGHT / 2);
        context.stroke();
      }
    });
  };
}

export function makeAudioCanvasDriver(elementId, width = 200, height = 200) {
  const element = document.getElementById(elementId);
  element.width = width;
  element.height = height;

  return AudioCanvasDriver(element);
}
