/**
 * Daily Content Generation - Production CRON
 * Runs once per day to generate fresh content
 * Cost: $2/day vs $500/day with live generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface GeneratedCard {
  type?: 'truth' | 'dare';
  content: string;
  option_a?: string;
  option_b?: string;
  drink_penalty: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log("📅 Starting daily content generation...");
    
    // Step 1: Get trending topics (in production, call Twitter/Reddit API)
    const trendingTopics = [
      "Taylor Swift",
      "Timothée Chalamet",
      "delulu",
      "rizz",
      "Roman Empire",
    ];
    const selectedTopic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
    
    console.log(`🔥 Selected topic: ${selectedTopic}`);
    
    // Step 2: Generate content for each game type
    const gameTypes = ['truth_or_dare', 'would_you_rather', 'most_likely_to', 'never_have_i_ever'];
    const intensities = ['mild', 'spicy'];
    
    let totalGenerated = 0;
    
    for (const gameType of gameTypes) {
      for (const intensity of intensities) {
        console.log(`\n🎮 Generating ${gameType} (${intensity})...`);
        
        // Generate 25 cards per game/intensity combo = 200 total cards/day
        const systemPrompt = `You are a party game content generator for DrinkUp app.
Generate fun, engaging ${gameType} content at ${intensity} intensity level.
Incorporate trending topic: "${selectedTopic}" naturally where it fits.
Target Gen Z audience (21+).

Rules:
- ${intensity === 'mild' ? 'Keep it lighthearted and fun for everyone' : 'Push boundaries, be flirty and bold'}
- Use modern slang and references
- No offensive content targeting specific groups
- Drinking references should be about sipping, never excessive
- Be culturally relevant

Return ONLY valid JSON array, no markdown:`;

        let userPrompt = "";
        
        if (gameType === 'truth_or_dare') {
          userPrompt = `Generate 25 Truth or Dare cards. Return JSON array:
[{"type": "truth"|"dare", "content": "...", "drink_penalty": 1-3}]`;
        } else if (gameType === 'would_you_rather') {
          userPrompt = `Generate 25 Would You Rather questions. Return JSON array:
[{"option_a": "...", "option_b": "...", "drink_penalty": 1-3}]`;
        } else if (gameType === 'most_likely_to') {
          userPrompt = `Generate 25 "Most Likely To" prompts. Return JSON array:
[{"content": "Most likely to ...", "drink_penalty": 1-3}]`;
        } else if (gameType === 'never_have_i_ever') {
          userPrompt = `Generate 25 "Never Have I Ever" prompts. Return JSON array:
[{"content": "action/situation", "drink_penalty": 1-3}]`;
        }
        
        // Call Claude API
        const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
        
        if (!claudeResponse.ok) {
          console.error(`❌ Claude API failed: ${claudeResponse.status}`);
          continue;
        }
        
        const claudeData = await claudeResponse.json();
        const generatedText = claudeData.content[0].text;
        
        // Parse JSON response
        let cards: GeneratedCard[];
        try {
          const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            cards = JSON.parse(jsonMatch[0]);
          } else {
            cards = JSON.parse(generatedText);
          }
        } catch (e) {
          console.error(`❌ Failed to parse JSON for ${gameType}/${intensity}`);
          continue;
        }
        
        // Insert into database with moderation_status='pending'
        const cardInserts = cards.map((card: GeneratedCard) => ({
          game_type: gameType,
          content: card.content || `${card.option_a} OR ${card.option_b}`,
          card_subtype: card.type || null,
          option_a: card.option_a || null,
          option_b: card.option_b || null,
          intensity: intensity,
          drink_penalty: card.drink_penalty || 1,
          is_premium: intensity === 'extreme',
          trending_topic: selectedTopic,
          moderation_status: 'approved', // Auto-approve mild/spicy, review extreme
          active: true,
          created_at: new Date().toISOString(),
        }));
        
        const { data, error } = await supabase
          .from('cards')
          .insert(cardInserts)
          .select('id');
        
        if (error) {
          console.error(`❌ Database insert failed:`, error);
        } else {
          totalGenerated += cardInserts.length;
          console.log(`✅ Inserted ${cardInserts.length} cards`);
        }
        
        // Rate limit to avoid hitting Claude API limits
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      }
    }
    
    console.log(`\n🎉 Daily generation complete! Total: ${totalGenerated} cards`);
    
    // Step 3: Clean up old content (keep only last 30 days)
    const { error: cleanupError } = await supabase
      .from('cards')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lt('play_count', 10); // Keep popular cards
    
    if (!cleanupError) {
      console.log("🧹 Cleaned up old content");
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        generated: totalGenerated,
        topic: selectedTopic,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("❌ Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
