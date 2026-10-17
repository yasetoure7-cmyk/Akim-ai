import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Schoolwork / Devoirs
  {
    category: 'school',
    emoji: '📐',
    labelEn: 'Math Help',
    labelFr: 'Aide en Maths',
    promptEn: 'Can you explain the Pythagorean theorem step-by-step with a simple example?',
    promptFr: 'Peux-tu m\'expliquer le théorème de Pythagore étape par étape avec un exemple simple ?',
  },
  {
    category: 'school',
    emoji: '🔬',
    labelEn: 'Science Explained',
    labelFr: 'Sciences simples',
    promptEn: 'Explain how photosynthesis works in plants in simple words.',
    promptFr: 'Explique-moi comment fonctionne la photosynthèse simplement.',
  },
  {
    category: 'school',
    emoji: '✍️',
    labelEn: 'Grammar & Essay',
    labelFr: 'Grammaire & Rédaction',
    promptEn: 'Help me outline a strong 3-paragraph essay about the importance of protecting nature.',
    promptFr: 'Aide-moi à structurer une rédaction en 3 parties sur l\'importance de protéger la nature.',
  },

  // Songs / Chansons
  {
    category: 'songs',
    emoji: '🎵',
    labelEn: 'Afrobeat / Pop Song',
    labelFr: 'Chanson Afro-Pop',
    promptEn: 'Write an upbeat, catchy Afrobeat song about chasing dreams and staying strong. Include verse 1, chorus, and verse 2 with rhythm cues!',
    promptFr: 'Écris-moi une chanson entraînante style Afro-Pop sur la poursuite de ses rêves et la persévérance. Avec couplets et refrain !',
  },
  {
    category: 'songs',
    emoji: '🎤',
    labelEn: 'Rap with Rhymes',
    labelFr: 'Rap avec rimes',
    promptEn: 'Write a smooth, motivational 16-bar rap verse with clever rhyme schemes about overcoming obstacles.',
    promptFr: 'Écris-moi 16 mesures de rap motivant avec de superbes rimes sur le dépassement de soi.',
  },
  {
    category: 'songs',
    emoji: '🎸',
    labelEn: 'Acoustic Ballad',
    labelFr: 'Ballade acoustique',
    promptEn: 'Write an emotional acoustic song about true friendship and loyalty, including chords (like G, Em, C, D).',
    promptFr: 'Écris-moi les paroles d\'une douce ballade sur la véritable amitié, avec suggestions d\'accords de guitare.',
  },

  // Jokes / Blagues
  {
    category: 'jokes',
    emoji: '😂',
    labelEn: 'Tell a Joke',
    labelFr: 'Raconte une blague',
    promptEn: 'Tell me a hilarious, clean joke that will make me laugh out loud!',
    promptFr: 'Raconte-moi une blague super drôle et propre pour me faire rire !',
  },
  {
    category: 'jokes',
    emoji: '🧩',
    labelEn: 'Clever Riddle',
    labelFr: 'Énigme maligne',
    promptEn: 'Give me a fun, tricky riddle and wait for me to guess before telling me the answer!',
    promptFr: 'Pose-moi une énigme amusante et laisse-moi deviner avant de donner la réponse !',
  },

  // General & Chat
  {
    category: 'general',
    emoji: '💡',
    labelEn: 'How Phones Work',
    labelFr: 'Comment marche un tel',
    promptEn: 'How does an Android smartphone touch screen actually detect our fingers? Explain simply.',
    promptFr: 'Comment l\'écran tactile d\'un smartphone détecte-t-il nos doigts ? Explique simplement.',
  },
  {
    category: 'chat',
    emoji: '🌟',
    labelEn: 'Motivation',
    labelFr: 'Motivation du jour',
    promptEn: 'I need some motivation today. What are 3 practical habits to stay focused and positive?',
    promptFr: 'J\'ai besoin d\'un coup de boost aujourd\'hui. Quels sont 3 conseils simples pour rester motivé et positif ?',
  },
];
