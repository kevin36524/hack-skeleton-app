#!/bin/bash

# git_ops.sh - A script to perform various git operations

set -e  # Exit on error

# Display usage information
usage() {
    echo "Usage: $0 <operator> [args...]"
    echo ""
    echo "Operators:"
    echo "  fetchAndSwitch <branch_name>              - Fetch and checkout a specific branch"
    echo "  commitAndPush <branch_name> <message>     - Rename branch, add all changes, commit, and push"
    echo "  setupGh <token>                           - Authenticate GitHub CLI with token and setup git"
    echo ""
    echo "Examples:"
    echo "  $0 fetchAndSwitch main"
    echo "  $0 fetchAndSwitch feature/new-feature"
    echo "  $0 commitAndPush feature/my-feature \"Add new feature\""
    echo "  $0 setupGh ghp_xxxxxxxxxxxx"
    exit 1
}

# Check if at least one argument is provided
if [ $# -lt 1 ]; then
    echo "Error: No operator provided"
    usage
fi

OPERATOR=$1
shift  # Remove the operator from arguments

# Process operators
case $OPERATOR in
    fetchAndSwitch)
        if [ $# -lt 1 ]; then
            echo "Error: fetchAndSwitch requires a branch name"
            usage
        fi

        BRANCH_NAME=$1
        echo "Fetching branch: $BRANCH_NAME"
        git fetch --depth 1 origin "$BRANCH_NAME":"$BRANCH_NAME"

        echo "Switching to branch: $BRANCH_NAME"
        git checkout "$BRANCH_NAME"

        echo "Successfully switched to $BRANCH_NAME"
        ;;

    commitAndPush)
        if [ $# -lt 2 ]; then
            echo "Error: commitAndPush requires a branch name and commit message"
            usage
        fi

        BRANCH_NAME=$1
        COMMIT_MESSAGE=$2

        echo "Renaming branch to: $BRANCH_NAME"
        git branch -m "$BRANCH_NAME"

        echo "Adding all changes..."
        git add .

        echo "Committing changes with message: $COMMIT_MESSAGE"
        git commit -am "$COMMIT_MESSAGE"

        echo "Pushing to origin/$BRANCH_NAME..."
        git push -f origin "$BRANCH_NAME"

        echo "Successfully committed and pushed to $BRANCH_NAME"
        ;;

    setupGh)
        if [ $# -lt 1 ]; then
            echo "Error: setupGh requires a GitHub token"
            usage
        fi

        TOKEN=$1

        echo "Authenticating GitHub CLI with token..."
        echo "$TOKEN" | gh auth login --with-token

        echo "Setting up git integration..."
        gh auth setup-git

        echo "Setting up git user..."
        git config --global user.name "Sandbox"
        git config --global user.email "sandbox@e2b.dev"

        echo "Successfully authenticated and configured GitHub CLI"
        ;;

    *)
        echo "Error: Unknown operator '$OPERATOR'"
        usage
        ;;
esac
