export function compare(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split(".");
  const pb = b.split(".");

  for (let i = 0; i < 3; i++) {
    let na = Number(pa[i]);
    let nb = Number(pb[i]);

    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
  }

  return 0;
}
