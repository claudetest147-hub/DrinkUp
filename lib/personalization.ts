import { Player } from '../types';

/**
 * Personalizes game prompts with player names
 * Examples:
 * - "Do an impression" → "Sarah, do an impression of Mike"
 * - "Most likely to..." → "Who's most likely to text their ex? Point at someone!"
 */
export function personalizePrompt(content: string, players: Player[], currentPlayerIndex?: number): string {
  if (players.length < 2) return content;
  
  const currentPlayer = currentPlayerIndex !== undefined ? players[currentPlayerIndex] : null;
  const otherPlayers = currentPlayerIndex !== undefined 
    ? players.filter((_, i) => i !== currentPlayerIndex)
    : players;
  
  // Random player for some prompts
  const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
  const randomPlayer2 = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
  
  // Personalization patterns
  const patterns = [
    // Truth or Dare patterns
    {
      match: /^(Do|Show|Let|Give|Text|Call|Send)/i,
      replace: currentPlayer ? `${currentPlayer.name}, $1` : content,
    },
    {
      match: /someone in the room|someone here|the group/i,
      replace: randomPlayer ? randomPlayer.name : '$&',
    },
    {
      match: /of someone/i,
      replace: randomPlayer ? `of ${randomPlayer.name}` : '$&',
    },
    // Would You Rather - add context
    {
      match: /^(Have|Be|Live|Give up)/i,
      replace: `${currentPlayer?.name || 'You'}, would you rather $1`,
    },
    // Most Likely To - make it more direct
    {
      match: /^Most likely to (.+)/i,
      replace: players.length > 2 
        ? `Who's most likely to $1? ${players.slice(0, 3).map(p => p.name).join(', ')}...`
        : `Who's most likely to $1?`,
    },
    // Never Have I Ever - add player context
    {
      match: /^(.+)/,
      replace: players.length > 2
        ? `Never have I ever $1 — ${players[0].name}, ${players[1].name}... who's done it?`
        : content,
    },
  ];
  
  let personalized = content;
  
  for (const pattern of patterns) {
    if (pattern.match.test(personalized)) {
      personalized = personalized.replace(pattern.match, pattern.replace);
      break; // Only apply first matching pattern
    }
  }
  
  return personalized;
}

/**
 * Adds player-specific flavor to card content
 */
export function addPlayerFlavor(content: string, player: Player): string {
  const flavors = [
    `${player.name}'s turn:`,
    `${player.name}, ready?`,
    `Alright ${player.name}...`,
    `${player.name}, your challenge:`,
  ];
  
  const randomFlavor = flavors[Math.floor(Math.random() * flavors.length)];
  return `${randomFlavor} ${content}`;
}
