export const PARAGRAPHS = {
  low: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing is a useful skill for many jobs.",
    "Practice every day to get faster and accurate."
  ],
  medium: [
    "Learning to type quickly allows you to express ideas without interruption.",
    "Consistency and proper finger placement reduce typos and increase speed.",
    "Focus on accuracy first; speed will follow naturally after practice."
  ],
  high: [
    "Advanced typists focus on rhythm, touch-typing, and minimizing hand movement across the keyboard.",
    "Complex vocabulary and punctuation challenge accuracy and require deliberate practice.",
    "Combining drills with real text passages helps transfer speed gains to everyday writing tasks."
  ]
};

export function pickParagraph(level: "low" | "medium" | "high") {
  const arr = PARAGRAPHS[level];
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calcWPM(charsTyped: number, elapsedSeconds: number) {
  if (elapsedSeconds <= 0) return 0;
  const words = charsTyped / 5;
  const minutes = elapsedSeconds / 60;
  return Math.round(words / minutes);
}

export function calcAccuracy(target: string, typed: string) {
  if (!typed.length) return 0;
  const len = Math.max(target.length, typed.length);
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, typed.length); i++) {
    if (target[i] === typed[i]) correct++;
  }
  return Math.round((correct / len) * 100);
}
