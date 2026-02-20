#!/bin/bash
# Sequential Chain Script
# Executes agents in sequence, passing output to next agent

# Usage: ./sequential-chain.sh "agent1:task1" "agent2:task2" "agent3:task3"

AGENTS=("$@")

echo "=== Sequential Chain Execution ==="
echo "Total agents: ${#AGENTS[@]}"
echo ""

PREV_OUTPUT=""

for i in "${!AGENTS[@]}"; do
    AGENT_INFO="${AGENTS[$i]}"
    AGENT_TYPE=$(echo "$AGENT_INFO" | cut -d':' -f1)
    TASK=$(echo "$AGENT_INFO" | cut -d':' -f2-)

    echo "Step $((i+1))/${#AGENTS[@]}: $AGENT_TYPE"
    echo "Task: $TASK"
    echo ""

    # In Claude Code, this would spawn the agent
    # For now, print the command that would be used
    echo "→ Spawning agent: $AGENT_TYPE"
    echo "→ Task: $TASK"
    echo "→ Previous output context: ${PREV_OUTPUT:0:100}..."
    echo ""

    # Simulated output (in real use, this comes from agent)
    PREV_OUTPUT="Output from $AGENT_TYPE processing: $TASK"

    echo "---"
    echo ""
done

echo "=== Chain Complete ==="
