import { useState, useRef } from "react";
import { pickParagraph, calcWPM, calcAccuracy } from "../utils/typingHelpers";
import { saveSessionApi } from "../services/sessionApi";

export default function TypingTest({ onFinish }: { onFinish: () => void }) {
  const [difficulty, setDifficulty] = useState<"low"|"medium"|"high">("medium");
  const [timeLimit, setTimeLimit] = useState(30);
  const [targetText, setTargetText] = useState(pickParagraph("medium"));
  const [typedText, setTypedText] = useState("");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(timeLimit);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  function startTest() {
    setTargetText(pickParagraph(difficulty));
    setTypedText("");
    setRemaining(timeLimit);
    setRunning(true);
    startRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startRef.current || Date.now())) / 1000);
      const left = Math.max(0, timeLimit - elapsed);
      setRemaining(left);
      if (left <= 0) finishTest();
    }, 1000);
  }

  async function finishTest() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsed = Math.floor((Date.now() - (startRef.current || Date.now())) / 1000);
    const wpm = calcWPM(typedText.length, elapsed || 1);
    const accuracy = calcAccuracy(targetText, typedText);

    // await saveSessionApi({
    //   wpm, accuracy,
    //   date: new Date().toISOString(),
    // });
// ...existing code...
await saveSessionApi({
  difficulty,
  timeLimit,
  targetText,
  typedText,
  wpm,
  accuracy,
  date: new Date().toISOString(),
  // samples: [] // if you want to add samples
});
// ...existing code...
    onFinish();
  }

  return (
    <div className="border p-4 rounded">
      <div className="flex gap-2 mb-3">
        <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value as "low" | "medium" | "high")}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={timeLimit} onChange={(e)=>setTimeLimit(Number(e.target.value))}>
          <option value={15}>15 sec</option>
          <option value={30}>30 sec</option>
          <option value={60}>1 min</option>
        </select>
        {!running && <button onClick={startTest} className="bg-blue-500 text-white px-3 rounded">Start</button>}
      </div>

      <p className="mb-3">{targetText}</p>
      <textarea
        disabled={!running}
        className="w-full border p-2 h-28"
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
      />

      {running && <p className="mt-2">Time left: {remaining}s</p>}
      {!running && typedText && <button onClick={finishTest} className="bg-green-500 text-white p-2 mt-2 rounded">Save Result</button>}
    </div>
  );
}
