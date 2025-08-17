#!/bin/bash

echo "🚀 School ID Card Management System - Deployment Script"
echo "======================================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: School ID Card Management System"
    git branch -M main
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already exists!"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🐙 Create GitHub Repository:"
echo "   - Go to https://github.com/new"
echo "   - Create a new repository named 'school-id-card-system'"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. 🔗 Connect to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/school-id-card-system.git"
echo "   git push -u origin main"
echo ""
echo "3. 🌐 Deploy Backend (Railway):"
echo "   - Go to https://railway.app"
echo "   - Sign up with GitHub"
echo "   - Create new project"
echo "   - Deploy from GitHub repo"
echo "   - Select the 'backend' folder"
echo ""
echo "4. 🎨 Deploy Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Sign up with GitHub"
echo "   - Import your repository"
echo "   - Deploy automatically"
echo ""
echo "5. 🌍 Buy Domain:"
echo "   - Go to https://namecheap.com or https://godaddy.com"
echo "   - Purchase your domain (e.g., schoolidcard.com)"
echo "   - Configure DNS settings"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Good luck with your deployment!"
