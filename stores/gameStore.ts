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
      
      // PRODUCTION: ALWAYS fetch from database (pre-generated via CRON)
      // NO live AI calls = $0 cost per game instead of $0.50
      console.log('📦 Fetching pre-generated content from database...');
      const dbCards = await fetchCards(gameType, intensity, 50);
      
      if (dbCards.length >= 20) {
        cards = dbCards;
        console.log(`✅ Loaded ${dbCards.length} cards from database`);
      } else {
        // Fallback: Mix database + viral content
        console.log('⚠️ Database has limited content, mixing with viral fallback');
        const { getViralContent } = await import('../constants/viralContent');
        const viralCards = getViralContent(gameType);
        
        cards = [...dbCards, ...viralCards.filter(c => c.intensity === intensity)];
        console.log(`🔥 Mixed: ${dbCards.length} DB + ${viralCards.length} viral = ${cards.length} total`);
      }
      
      // If still not enough, use hardcoded fallback
      if (cards.length < 10) {
        console.log('⚠️ Using hardcoded fallback content');
        const { getFallbackContent } = await import('../lib/content');
        const fallbackCards = await getFallbackContent(gameType);
        cards = [...cards, ...fallbackCards];
      }
      
      // Shuffle cards for variety
      const shuffled = [...cards].sort(() => Math.random() - 0.5);

      const session: GameSession = {
        id: Date.now().toString(),
        game_type: gameType,
        players,
        currentPlayerIndex: 0,
        currentCardIndex: 0,
        cards: shuffled.slice(0, 50), // Limit to 50 cards per session
        intensity,
        isActive: true,
      };

      set({ session, isLoading: false, freeCardsUsed: 0 });
      
      // Log analytics event
      console.log(`🎮 Game started: ${gameType}, ${session.cards.length} cards, ${players.length} players`);
      console.log(`💰 Cost: $0.00 (vs $0.50 with live AI)`);
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
