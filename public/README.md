# Firebase Hosting Directory

This directory contains the files that will be deployed to Firebase Hosting.

## Contents

- `index.html` - The main HTML file for the application
- `parser.js` - JavaScript module for parsing DCUI markdown
- `renderer.js` - JavaScript module for rendering DCUI to SVG
- `icons.js` - JavaScript module containing icon definitions

## Deployment

To prepare files for deployment:

1. Run `make release` from the project root
2. Use Firebase CLI to deploy: `firebase deploy --only hosting`

Note: You need to have Firebase CLI installed and be logged in to deploy.