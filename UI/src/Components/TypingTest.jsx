import React, { useEffect, useRef, useState } from "react";
import Charts from "../Components/Charts";
import { saveTestResult } from "../../services/testResults";

const PARAGRAPHS = {
    low: [
        "The cat sat on the mat and looked at the sky.",
        "It is warm today and the sun is shining bright.",
        "A simple walk in the park helps clear the mind.",
    ],
    medium: [
        "Technology changes quickly and we must learn to adapt to new tools.",
        "Cooking a meal requires patience, good ingredients, and attention to detail.",
        "Reading daily improves vocabulary and can transport you to other worlds.",
    ],
    high: [
        "The juxtaposition of light and shadow brought an uncanny depth to the photograph, highlighting subtle gradients.",
        "Quantum mechanics remains a fascinating, often counterintuitive field that challenges our understanding of reality.",
        "Meticulous attention to detail during development prevents cascading bugs in production deployments."
    ]
};

function pickParagraph(level) {
    const arr = PARAGRAPHS[level];
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function TypingTest() {
    const [difficulty, setDifficulty] = useState("medium");
    const [duration, setDuration] = useState(30); // seconds
    const [targetText, setTargetText] = useState(() => pickParagraph("medium"));
    const [input, setInput] = useState("");
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [charCount, setCharCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [history, setHistory] = useState([]); // per-second WPM snapshots
    const intervalRef = useRef(null);
    const startedAtRef = useRef(null);
    const inputRef = useRef("");

    useEffect(() => {
        setTargetText(pickParagraph(difficulty));
        resetTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty]);

    useEffect(() => {
        setTimeLeft(duration);
        resetTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    useEffect(() => {
        inputRef.current = input;
    }, [input]);

    function resetTest() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setStarted(false);
        setInput("");
        setWpm(0);
        setAccuracy(100);
        setCharCount(0);
        setMistakes(0);
        setHistory([]);
        startedAtRef.current = null;
        setTimeLeft(duration);
    }

    function computeStats(currentInput) {
        const charsTyped = currentInput.length;
        const mistakesLocal = [...currentInput].reduce((acc, ch, i) => {
            if (i >= targetText.length) return acc + 1;
            return acc + (ch === targetText[i] ? 0 : 1);
        }, 0);
        // words typed approximated by characters / 5
        const wordsTyped = charsTyped / 5;
        const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
        const wpmLocal = Math.round((wordsTyped / elapsedSeconds) * 60);
        const accuracyLocal = Math.max(0, Math.round(((charsTyped - mistakesLocal) / Math.max(1, charsTyped)) * 100));
        setCharCount(charsTyped);
        setMistakes(mistakesLocal);
        setWpm(isFinite(wpmLocal) ? wpmLocal : 0);
        setAccuracy(isFinite(accuracyLocal) ? accuracyLocal : 100);
        return { wpmLocal };
    }

    function startTest() {
        if (started) return;
        setStarted(true);
        startedAtRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setStarted(false);

                    // Final snapshot
                    setHistory((h) => {
                        const finalHistory = [...h, { second: duration, wpm }];

                        // ✅ Save ONCE here after history is finalized
                        saveTestResult({
                            duration,
                            wpm,
                            accuracy,
                            mistakes,
                            snapshots: finalHistory,
                        })
                            .then((res) => console.log("✅ Result saved:", res))
                            .catch((err) => console.error("❌ Failed to save:", err));

                        return finalHistory;
                    });

                    return 0;
                }
                return t - 1;
            });

            // per-second snapshot
            setHistory((h) => {
                const now = Date.now();
                const elapsed = Math.max(1, Math.floor((now - startedAtRef.current) / 1000));
                const charsTyped = inputRef.current.length;

                const mistakesLocal = [...inputRef.current].reduce((acc, ch, i) => {
                    if (i >= targetText.length) return acc + 1;
                    return acc + (ch === targetText[i] ? 0 : 1);
                }, 0);

                const wordsTyped = charsTyped / 5;
                const snapshotWpm = Math.round((wordsTyped / elapsed) * 60) || 0;

                return [
                    ...h,
                    {
                        second: h.length + 1,
                        wpm: snapshotWpm,
                        charCount: charsTyped,
                        mistakes: mistakesLocal,
                    },
                ];
            });
        }, 1000);
    }


    function handleChange(e) {
        const val = e.target.value;
        if (!started) startTest();
        setInput(val);
        computeStats(val);
    }

    function handleRestart() {
        setTargetText(pickParagraph(difficulty));
        resetTest();
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="px-2 py-1 rounded border dark:bg-gray-900"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="px-2 py-1 rounded border dark:bg-gray-900"
                        >
                            <option value={15}>15s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm">
                        <div>Time left: <span className="font-semibold">{timeLeft}s</span></div>
                        <div>WPM: <span className="font-semibold">{wpm}</span></div>
                    </div>
                    <button onClick={handleRestart} className="px-3 py-1 rounded border dark:border-gray-700">Restart</button>
                </div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
                <p className="mb-3 whitespace-pre-wrap">{targetText}</p>

                <textarea
                    value={input}
                    onChange={handleChange}
                    placeholder="Start typing here..."
                    className="w-full min-h-[120px] p-3 rounded border dark:bg-gray-900 focus:outline-none"
                    disabled={timeLeft === 0}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="WPM" value={wpm} />
                <StatCard label="Accuracy" value={`${accuracy}%`} />
                <StatCard label="Characters" value={charCount} />
                <StatCard label="Mistakes" value={mistakes} />
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
                <h4 className="font-semibold mb-3">Performance Charts</h4>
                <Charts snapshots={history} summary={{ wpm, accuracy, charCount, mistakes, duration }} />
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="p-3 rounded bg-white dark:bg-gray-900 border dark:border-gray-700 text-center shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}
