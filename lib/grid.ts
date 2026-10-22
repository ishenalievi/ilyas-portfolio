/** Columns for a wide-screen grid of n items: one that divides evenly, else the one leaving the fullest last row. */
export function fitCols(n: number, options = [5, 4, 3]) {
  return options.find((c) => n % c === 0) ?? [...options].sort((a, b) => (n % b) - (n % a))[0];
}
