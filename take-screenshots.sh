#!/bin/bash

# DrinkUp - Automated Screenshot Script
# Run this after launching the app in iOS Simulator

SCREENSHOTS_DIR="$HOME/Desktop/DrinkUp-Screenshots"
mkdir -p "$SCREENSHOTS_DIR"

echo "📸 DrinkUp Screenshot Tool"
echo "=========================="
echo ""
echo "Screenshots will be saved to: $SCREENSHOTS_DIR"
echo ""
echo "Instructions:"
echo "1. Launch DrinkUp in iOS Simulator"
echo "2. Navigate to each screen as prompted"
echo "3. Press ENTER after each navigation"
echo ""

# Screenshot 1: Home
echo "📱 Screenshot 1: Navigate to HOME screen (Games tab)"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/1-home.png"
echo "✅ Saved: 1-home.png"
echo ""

# Screenshot 2: Truth or Dare
echo "📱 Screenshot 2: Open Truth or Dare game (play a few cards)"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/2-truth-or-dare.png"
echo "✅ Saved: 2-truth-or-dare.png"
echo ""

# Screenshot 3: Would You Rather
echo "📱 Screenshot 3: Open Would You Rather game"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/3-would-you-rather.png"
echo "✅ Saved: 3-would-you-rather.png"
echo ""

# Screenshot 4: Player Setup
echo "📱 Screenshot 4: Show Player Setup screen (add 4 players)"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/4-player-setup.png"
echo "✅ Saved: 4-player-setup.png"
echo ""

# Screenshot 5: Profile
echo "📱 Screenshot 5: Navigate to PROFILE tab"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/5-profile.png"
echo "✅ Saved: 5-profile.png"
echo ""

# Screenshot 6: Daily
echo "📱 Screenshot 6: Navigate to DAILY tab"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/6-daily.png"
echo "✅ Saved: 6-daily.png"
echo ""

# Screenshot 7: Paywall
echo "📱 Screenshot 7: Play 10 cards to trigger paywall"
read -p "Press ENTER when ready..."
xcrun simctl io booted screenshot "$SCREENSHOTS_DIR/7-paywall.png"
echo "✅ Saved: 7-paywall.png"
echo ""

echo "✅ All screenshots captured!"
echo "📁 Location: $SCREENSHOTS_DIR"
echo ""
echo "Next steps:"
echo "1. Review screenshots"
echo "2. Resize if needed (should be 1290x2796)"
echo "3. Upload to App Store Connect"
