export function safeCpm(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 1000).toFixed(4));
}

export function shouldCheckMetric(bidCpm: number, mediaCpm: number) {
  return bidCpm < mediaCpm;
}
