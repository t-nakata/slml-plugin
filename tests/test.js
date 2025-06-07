// Import the parser
import { parseSLML } from '../parser.js';

// Test SLML with BottomNavigationBar and multiple BottomNavigationItems
const testSLML = `Screen: Test Screen
- BottomNavigationBar: Navigation { backgroundColor: #ffffff }
  - BottomNavigationItem: Home { icon: 🏠, active: true }
  - BottomNavigationItem: Search { icon: 🔍 }
  - BottomNavigationItem: Profile { icon: 👤 }
  - BottomNavigationItem: Settings { icon: ⚙️ }`;

// Parse the SLML
const parsedScreen = parseSLML(testSLML);

// Output the parsed result
console.log('Parsed Screen:', JSON.stringify(parsedScreen, null, 2));

// Check if BottomNavigationBar has children
const bottomNavBar = parsedScreen.elements.find(el => el.type.toLowerCase() === 'bottomnavigationbar');
if (bottomNavBar && bottomNavBar.children && bottomNavBar.children.length > 0) {
  console.log('Success: BottomNavigationBar has ' + bottomNavBar.children.length + ' children');
  console.log('Children:', bottomNavBar.children);
} else {
  console.error('Error: BottomNavigationBar has no children or is missing');
}