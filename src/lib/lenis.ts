import Lenis from '@studio-freight/lenis'

export function initLenis() {
  const lenis = new Lenis({
    duration: 0.6,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
  return lenis
}