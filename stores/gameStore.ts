import { create } from 'zustand';
import { GameCard, GameSession, GameType, Intensity, Player } from '../types';
import { fetchCards } from '../lib/content';

interface GameStore {
  session: GameSession | null;
  isLoading: boolean;
  freeCardsUsed: number;
  startGame: (gameType: GameType, players: Player[], intensity: Intensity) => Promise<void>;
  nextCard: () => void;
  nextPlayer: () => void;
  endGame: () => void;
}

const FREE_CARD_LIMIT = 10;

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  isLoading: false,
  freeCardsUsed: 0,

  startGame: async (gameType, players, intensity) => {
    set({ isLoading: true });
    
    try {
      const cards = await fetchCards(gameType, intensity, 30);
      
      // Shuffle cards
      const shuffled = [...cards].sort(() => Math.random() - 0.5);

      const session: GameSession = {
        id: Date.now().toString(),
        game_type: gameType,
        players,
        currentPlayerIndex: 0,
        currentCardIndex: 0,
        cards: shuffled,
        intensity,
        isActive: true,
      };

      set({ session, isLoading: false, freeCardsUsed: 0 });
    } catch (error) {
      console.error('Error starting game:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  nextCard: () => {
    const { session, freeCardsUsed } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        currentCardIndex: session.currentCardIndex + 1,
      },
      freeCardsUsed: freeCardsUsed + 1,
    });
  },

  nextPlayer: () => {
    const { session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        currentPlayerIndex: (session.currentPlayerIndex + 1) % session.players.length,
      },
    });
  },

  endGame: () => set({ session: null, freeCardsUsed: 0 }),
}));
