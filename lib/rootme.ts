export interface Category {
  name: string;
  percent: number;
  points: number;
  solved: number;
  total: number;
  solved_challenges: string[];
  unsolved_challenges: string[];
}

export interface RootMeData {
  username: string;
  rank: number;
  score: number;
  total_solved: number;
  categories: Category[];
}

import data from "./rootme_data.json";

export function getRootMeData(): RootMeData {
  return data as RootMeData;
}

export const CAT_ICONS: Record<string, string> = {
  "Web - Serveur": "🌐",
  "Web - Client": "🖥️",
  "App - Script": "📜",
  "App - Système": "⚙️",
  "Cryptanalyse": "🔐",
  "Forensic": "🔎",
  "Réseau": "📡",
  "Stéganographie": "🖼️",
  "Cracking": "🧩",
  "Réaliste": "🎯",
  "Programmation": "💾",
};
