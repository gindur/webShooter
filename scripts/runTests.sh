#!/bin/bash

# Set colors for prettier output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}       Running WebShooter Tests         ${NC}"
echo -e "${YELLOW}=========================================${NC}"

# Run the tests
npm test -- --watchAll=false

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}=========================================${NC}"
  echo -e "${GREEN}          All tests passed!             ${NC}"
  echo -e "${GREEN}=========================================${NC}"
  exit 0
else
  echo -e "${RED}=========================================${NC}"
  echo -e "${RED}      Some tests failed. Fix them!       ${NC}"
  echo -e "${RED}=========================================${NC}"
  exit 1
fi 