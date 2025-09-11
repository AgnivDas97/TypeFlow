// src/types.d.ts
export type User = { id: string; name: string; email: string };
export type Session = { _id?: string; date: string; difficulty: "low"|"medium"|"high"; wpm: number; accuracy: number };
export {};
