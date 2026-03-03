#!/bin/bash

# DrinkUp Edge Function Deployment Script
# Run this after logging into Supabase CLI

set -e

echo "🚀 Deploying DrinkUp Edge Functions..."

# Step 1: Login (opens browser)
echo "📝 Step 1: Login to Supabase"
supabase login

# Step 2: Link project
echo "🔗 Step 2: Linking to project"
supabase link --project-ref yicbsjkdioiknonuuhvf

# Step 3: Set secrets
echo "🔐 Step 3: Setting secrets"
echo "Enter your Claude API key:"
read -s CLAUDE_KEY
supabase secrets set CLAUDE_API_KEY="$CLAUDE_KEY"

# Step 4: Deploy function
echo "☁️ Step 4: Deploying Edge Function"
supabase functions deploy daily-content-generation

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the function manually:"
echo "   curl -X POST 'https://yicbsjkdioiknonuuhvf.supabase.co/functions/v1/daily-content-generation' \\"
echo "     -H 'Authorization: Bearer <your-service-role-key>'"
echo ""
echo "2. Set up CRON job (see DEPLOY_CHECKLIST.md)"
echo ""
echo "🎉 Your Edge Function is live!"
