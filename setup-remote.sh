#!/bin/bash

# Script to set up git remote for the events site
# Usage: ./setup-remote.sh <repository-url>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <repository-url>"
    echo "Example: $0 https://github.com/yourusername/events-site.git"
    exit 1
fi

REPO_URL=$1

echo "Setting up remote origin..."
git remote add origin $REPO_URL

echo "Setting upstream branch..."
git branch --set-upstream-to=origin/main main

echo "Pushing to remote..."
git push -u origin main

echo "Remote setup complete!"
echo "Repository URL: $REPO_URL"
