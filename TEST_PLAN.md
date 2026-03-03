# DrinkUp - Comprehensive Test Plan

## Test Scenarios

### Player Count Tests
- [ ] 2 players (minimum)
- [ ] 4 players (typical)
- [ ] 6 players (large group)
- [ ] 8 players (maximum)
- [ ] 1 player (should fail)
- [ ] 9 players (should fail)

### Edge Cases - Player Names
- [ ] Empty string ("")
- [ ] Only spaces ("   ")
- [ ] Single character ("A")
- [ ] 20 characters (max allowed)
- [ ] 21+ characters (should fail)
- [ ] Special characters ("@#$%")
- [ ] Numbers only ("123")
- [ ] Emoji ("😀")
- [ ] SQL injection ("'; DROP TABLE--")
- [ ] Duplicate names (should fail)

### Game Flow Tests
- [ ] Start game → See player setup
- [ ] Enter names → Start button enabled
- [ ] Play 1 card → Next button works
- [ ] Play 10 cards → Paywall appears
- [ ] Play 11 cards → Blocked
- [ ] Close paywall → Resume at card 10
- [ ] Complete full game → End screen
- [ ] Back button → Return to home

### All Game Types
- [ ] Truth or Dare → Choice cards → Card display
- [ ] Would You Rather → A vs B → Voting
- [ ] Most Likely To → Player list → Voting → Reveal
- [ ] Never Have I Ever → Card display → Next

### Rate Limiting
- [ ] Start 10 games → Should work
- [ ] Start 11th game → Should fail
- [ ] Wait 1 minute → Should reset

### Data & Content
- [ ] Database cards load (not fallback)
- [ ] Fallback works if DB empty
- [ ] Mix of intensities (mild/spicy)
- [ ] No duplicate cards in session
- [ ] Cards shuffled each game

### Offline Mode
- [ ] Disconnect network
- [ ] Start game → Fallback content loads
- [ ] All games still work

### Performance
- [ ] Home loads < 1s
- [ ] Game start < 500ms
- [ ] Card navigation < 50ms
- [ ] No memory leaks after 10 games

### UI/UX
- [ ] All buttons clickable
- [ ] Text readable
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] Haptic feedback works

### Security
- [ ] Input validation blocks invalid names
- [ ] Rate limiting enforced
- [ ] No SQL injection possible
- [ ] No XSS attacks possible
