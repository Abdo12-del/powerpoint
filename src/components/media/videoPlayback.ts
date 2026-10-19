/** Compute the controlled ReactPlayer state; an inactive slide must always be paused. */
export function getMediaVideoPlaying(active: boolean, autoPlay: boolean, userPaused: boolean): boolean | undefined {
  if (!active) return false;
  return autoPlay ? !userPaused : undefined;
}
