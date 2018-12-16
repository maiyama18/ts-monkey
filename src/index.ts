export const hello = (target: string) => {
  if (target == null || target.length === 0) {
    return `hello!`;
  }
  return `hello ${target}!`;
};
