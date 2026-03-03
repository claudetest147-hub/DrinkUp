import { create } from 'zustand';
import { GameCard, GameSession, GameType, Intensity, Player } from '../types';
import { fetchCards } from '../lib/content';
import { generateAIContent } from '../lib/ai';

interface GameStore {
  session: GameSession | null;
  isLoading: boolean;
  freeCardsUsed: number;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  startGame: (gameType: GameType, players: Player[], intensity: Intensity) => Promise<void>;
  nextCard: () => void;
  nextPlayer: () => void;
  endGame: () => void;
  checkFreeLimit: () => boolean;
}

const FREE_CARD_LIMIT = 10;

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  isLoading: false,
  freeCardsUsed: 0,
  showPaywall: false,
  
  setShowPaywall: (show) => set({ showPaywall: show }),
  
  checkFreeLimit: () => {
    const { freeCardsUsed } = get();
    return freeCardsUsed >= FREE_CARD_LIMIT;
  },

  startGame: async (gameType, players, intensity) => {
    set({ isLoading: true });
    
    try {
      let cards: GameCard[] = [];
      
      // Try AI generation first (if we have player names)
      if (players.length > 0 && Math.random() > 0.5) { // 50% chance to use AI
        const playerNames = players.map(p => p.name);
        const aiResult = await generateAIContent(gameType, intensity, playerNames);
        
        if (aiResult?.cards && aiResult.cards.length > 0) {
          cards = aiResult.cards;
          console.log('✨ Using AI-generated content');
        }
      }
      
      // Fallback to database cards if AI didn't work
      if (cards.length === 0) {
        cards = await fetchCards(gameType, intensity, 30);
        console.log('📦 Using database content');
      }
      
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
    const { session, freeCardsUsed, checkFreeLimit } = get();
    if (!session) return;

    const newCardsUsed = freeCardsUsed + 1;
    
    // Check if user hit free limit (but allow them to see current card)
    if (newCardsUsed > FREE_CARD_LIMIT) {
      set({ showPaywall: true });
      return;
    }

    set({
      session: {
        ...session,
        currentCardIndex: session.currentCardIndex + 1,
      },
      freeCardsUsed: newCardsUsed,
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
