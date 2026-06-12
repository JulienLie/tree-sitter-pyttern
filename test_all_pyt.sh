#!/bin/bash

# Directory containing the tests
TEST_DIR="/home/julien/Documents/phd/Pyttern/tests/tests_files/"

# Count totals
TOTAL=0
SUCCESS=0
FAILED=0

echo "Starting bulk parse test on $TEST_DIR"
echo "--------------------------------------"

# Find all .pyt and .pyh files
FILES=$(find "$TEST_DIR" -type f \( -name "*.pyt" -o -name "*.pyh" \))

for FILE in $FILES; do
    ((TOTAL++))
    # Parse the file. We use --quiet to not see the tree, and we check the exit code.
    # We also check for ERROR nodes in the output just in case.
    OUTPUT=$(npx tree-sitter parse "$FILE" --quiet 2>&1)
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ] && [[ ! "$OUTPUT" =~ "ERROR" ]]; then
        ((SUCCESS++))
        # echo "✓ $FILE"
    else
        ((FAILED++))
        echo "✗ $FILE"
        echo "$OUTPUT" | grep -i "error" | head -n 5
    fi
done

echo "--------------------------------------"
echo "Total: $TOTAL"
echo "Success: $SUCCESS"
echo "Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo "All files parsed successfully!"
    exit 0
else
    echo "Some files failed to parse."
    exit 1
fi
