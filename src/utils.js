export const toHertz = f0 => semitoneStep => {
  const a = 2 ** (1/12);
  return f0 * (a ** semitoneStep);
};

export const classnames = (propsObj) =>
  Object.keys(propsObj)
  .reduce((classString, cls) => propsObj[cls] ? `${classString} ${cls}` : classString, '')
  .trim();

export const diff = (list1, list2) => [
  list1.filter(x => !list2.includes(x)),
  list2.filter(x => !list1.includes(x))
];
