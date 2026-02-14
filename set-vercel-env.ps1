# PowerShell script to set Vercel environment variables
# Run this script: ./set-vercel-env.ps1

Write-Host "Setting up Vercel Environment Variables..." -ForegroundColor Green

# Set GOOGLE_CLIENT_ID
Write-Host "`n1. Setting GOOGLE_CLIENT_ID..." -ForegroundColor Yellow
echo "1021932929112-hp69oq8unuo4lesad225fha9gk77lk9v.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID production preview development

# Set GOOGLE_CLIENT_SECRET
Write-Host "`n2. Setting GOOGLE_CLIENT_SECRET..." -ForegroundColor Yellow
echo "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" | vercel env add GOOGLE_CLIENT_SECRET production preview development

# Set GOOGLE_CALLBACK_URL
Write-Host "`n3. Setting GOOGLE_CALLBACK_URL..." -ForegroundColor Yellow
echo "https://learn-taiwanese-pro.vercel.app/api/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL production preview development

Write-Host "`n✅ All environment variables set!" -ForegroundColor Green
Write-Host "Now run: vercel --prod" -ForegroundColor Cyan
