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
      const playerNames = players.map(p => p.name);
      
      // ALWAYS try AI generation first (100% of time)
      console.log('🤖 Attempting AI generation...');
      const aiResult = await generateAIContent(gameType, intensity, playerNames);
      
      if (aiResult?.cards && aiResult.cards.length > 0) {
        cards = aiResult.cards;
        console.log('✨ Using AI-generated content (FRESH)');
      } else {
        // Fallback 1: Try database cards
        console.log('⚠️ AI failed, trying database...');
        const dbCards = await fetchCards(gameType, intensity, 30);
        
        if (dbCards.length > 5) {
          cards = dbCards;
          console.log('📦 Using database content');
        } else {
          // Fallback 2: Use viral content (research-backed)
          console.log('⚠️ Database limited, using viral content');
          const { getViralContent } = await import('../constants/viralContent');
          const viralCards = getViralContent(gameType);
          
          if (viralCards.length > 0) {
            cards = viralCards;
            console.log('🔥 Using viral content (high-engagement)');
          } else {
            // Fallback 3: Use basic fallback
            cards = await fetchCards(gameType, intensity, 10);
            console.log('📝 Using basic fallback');
          }
        }
      }
      
      // Mix in some viral content for variety (30% of cards)
      if (cards.length > 10) {
        const { getViralContent } = await import('../constants/viralContent');
        const viralCards = getViralContent(gameType);
        const viralCount = Math.floor(cards.length * 0.3);
        const viralToAdd = viralCards
          .filter(c => c.intensity === intensity)
          .slice(0, viralCount);
        cards = [...cards, ...viralToAdd];
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
      
      // Log metrics for analytics
      console.log(`🎮 Game started: ${gameType}, ${cards.length} cards, ${players.length} players`);
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
