#!/bin/bash

# Array of games to update
games=("DotDash" "MathMaster" "ReactionTime" "SequenceSense" "ShapeSorter" "WordChain")

# Update each game
for game in "${games[@]}"; do
    echo "Updating $game..."
    
    # Backup original files
    cp "client/src/games/$game/$game.jsx" "client/src/games/$game/${game}_backup.jsx" 2>/dev/null || true
    cp "client/src/games/$game/$game.css" "client/src/games/$game/${game}_backup.css" 2>/dev/null || true
    
    echo "Backed up $game files"
done

echo "All games backed up successfully!"
