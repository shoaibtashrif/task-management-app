#!/bin/bash

echo "Setting up Task Management Database..."

# Create database if it doesn't exist
psql -U postgres -c "CREATE DATABASE task_management;" 2>/dev/null || echo "Database already exists"

# Run the schema
psql -U postgres -d task_management -f src/db/schema.sql

echo "Database setup complete!"
echo "You can now start the server with: npm run dev" 