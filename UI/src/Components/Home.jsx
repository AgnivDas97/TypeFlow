import React from "react";
import TypingTest from "./TypingTest";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2">
        <TypingTest />
      </section>

      <aside className="space-y-4">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <h3 className="font-semibold mb-2">How it works</h3>
          <p className="text-sm">
            Choose difficulty, duration and start typing. Your WPM, accuracy and per-second progress are captured and shown in charts.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <h3 className="font-semibold mb-2">Tips</h3>
          <ul className="list-disc list-inside text-sm">
            <li>Take the test without looking away.</li>
            <li>Use proper finger placement for better accuracy.</li>
            <li>Retry with different durations to track improvements.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
