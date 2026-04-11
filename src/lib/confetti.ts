import confetti from "canvas-confetti";

/** 개념 완료 — 작은 축하 */
export function fireMiniConfetti() {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#6366f1", "#8b5cf6", "#06b6d4", "#22c55e"],
    ticks: 120,
    gravity: 1.2,
    scalar: 0.8,
  });
}

/** 퀴즈 통과 — 중간 축하 */
export function fireQuizConfetti() {
  const end = Date.now() + 1500;
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e"];
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Summit 도달 — 풀스크린 축하 */
export function fireSummitConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.5 },
      colors: ["#ffd700", "#ff6b6b", "#6366f1", "#06b6d4"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.5 },
      colors: ["#ffd700", "#ff6b6b", "#6366f1", "#06b6d4"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
