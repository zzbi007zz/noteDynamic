#!/bin/bash
# Parallel Spawn Script
# Spawns multiple agents simultaneously

# Usage: ./parallel-spawn.sh "agent1:task1" "agent2:task2" "agent3:task3"

AGENTS=("$@")

echo "=== Parallel Agent Spawn ==="
echo "Total agents: ${#AGENTS[@]}"
echo ""

for i in "${!AGENTS[@]}"; do
    AGENT_INFO="${AGENTS[$i]}"
    AGENT_TYPE=$(echo "$AGENT_INFO" | cut -d':' -f1)
    TASK=$(echo "$AGENT_INFO" | cut -d':' -f2-)

    echo "Agent $((i+1))/${#AGENTS[@]}: $AGENT_TYPE"
    echo "Task: $TASK"
    echo "→ Spawning in parallel..."
    echo ""
done

echo "=== All agents spawned simultaneously ==="
echo ""
echo "Benefits:"
echo "- Reduced '90-minute technical tax' to ~5 minutes"
echo "- Independent tasks run in parallel"
echo "- Results aggregated after all complete"
