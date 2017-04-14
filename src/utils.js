export const log = msg => x => console.log(msg || '', x);

export const toHertz = f0 => semitoneStep => {
  const a = 2 ** (1/12);
  return f0 * (a ** semitoneStep);
};

export const classnames = (propsObj) =>
  Object.keys(propsObj)
  .reduce((classString, cls) => propsObj[cls] ? `${classString} ${cls}` : classString, '')
  .trim();
