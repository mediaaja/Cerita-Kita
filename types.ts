export interface Character {
  id: string;
  name: string;
  gender: string;
  age: string;
  ageDescription: string;
  role: string; // Protagonist, Antagonist, etc.
}

export interface DialogItem {
  id: string;
  speaker: string;
  mood: string;
  bodyCondition: string;
  text: string;
  description: string;
}

export interface StoryState {
  id: string;
  folderId: string;
  mainTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  
  // Settings
  environment: string;
  environmentDesc: string;
  location: string;
  locationDesc: string;
  
  // Meta
  genres: string[];
  genreDesc: string;
  language: string;
  
  // Content
  characters: Character[];
  dialogs: DialogItem[];
  
  // AI Results
  generatedJson: string | null;
  generatedContent: string | null;
}

export interface Folder {
  id: string;
  name: string;
}

export const GENDERS = ['Laki-laki', 'Perempuan', 'Non-Binary', 'Robot/AI', 'Makhluk Mitos', 'Lainnya'];

export const GENRES = [
  'Fantasi', 'Sci-Fi', 'Romance', 'Horor', 'Misteri', 'Thriller', 
  'Sejarah', 'Komedi', 'Drama', 'Petualangan', 'Isekai', 'Slice of Life',
  'Cyberpunk', 'Steampunk', 'Dystopian'
];

export const LANGUAGES = [
  'Bahasa Indonesia', 'English (US)', 'English (UK)', 'Jawa', 'Sunda', 
  'Japanese', 'Korean', 'Mandarin', 'Spanish', 'French', 'German', 'Russian'
];
