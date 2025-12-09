import { StoryState, Folder } from './types';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Novel Fantasi 2024' },
  { id: 'f2', name: 'Ide Konten YouTube' },
];

export const DEFAULT_STORY: StoryState = {
  id: '',
  folderId: 'f1',
  mainTitle: '',
  chapterTitle: '',
  chapterNumber: 1,
  environment: '',
  environmentDesc: '',
  location: 'Default',
  locationDesc: '',
  genres: [],
  genreDesc: '',
  language: 'Bahasa Indonesia',
  characters: [],
  dialogs: [],
  generatedJson: null,
  generatedContent: null,
};

export const EXAMPLE_STORY: Partial<StoryState> = {
  mainTitle: "Legenda Pedang Naga",
  chapterTitle: "Pertemuan di Hutan Kabut",
  chapterNumber: 1,
  environment: "Hutan lebat dengan kabut tebal yang membatasi jarak pandang.",
  environmentDesc: "Suasana mencekam, suara burung hantu terdengar samar. Cahaya matahari sulit menembus kanopi pohon.",
  location: "Hutan Terlarang Bagian Utara",
  locationDesc: "Area yang jarang dijamah manusia, konon tempat tinggal roh kuno.",
  genres: ["Fantasi", "Petualangan", "Misteri"],
  genreDesc: "Fokus pada pengembangan karakter dan world-building magis.",
  language: "Bahasa Indonesia",
  characters: [
    {
      id: 'c1',
      name: 'Arjuna',
      gender: 'Laki-laki',
      age: '19',
      ageDescription: 'Wajah muda namun penuh luka gores, tatapan mata tajam.',
      role: 'Protagonist'
    }
  ],
  dialogs: [
    {
      id: 'd1',
      speaker: 'Arjuna',
      mood: 'Waspada',
      bodyCondition: 'Nafas terengah-engah, memegang gagang pedang erat',
      text: "Siapa di sana? Tunjukkan wujudmu!",
      description: 'Arjuna mendengar suara ranting patah di belakangnya.'
    }
  ]
};