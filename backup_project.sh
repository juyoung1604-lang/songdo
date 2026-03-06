#!/bin/bash
# Backup script for Songdo Project

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="songdo_backup_${TIMESTAMP}.tar.gz"

echo "Creating backup: ${BACKUP_FILE}..."

# Create a tarball of important directories, excluding node_modules and .next
tar -czf "${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    app components lib public package.json tsconfig.json tailwind.config.ts next.config.ts

echo "Backup created successfully at $(pwd)/${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"
