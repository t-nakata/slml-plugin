// Import the parser
import { parseSLML, processMarkdown } from '../parser.js';

// Test SLML with all element types
const testSLML = `# All Elements Test
screen:
  title: "All Elements Test"
  size: 400, 800
  backgroundColor: #f5f5f5

appbar:
  title: "All Elements"
  backgroundColor: #2196F3
  showBackButton: true
  centerTitle: true
  actionIcons: 🔍|⚙️|👤

input:
  label: "Username"
  align: center
  backgroundColor: #ffffff

button:
  label: "Submit"
  align: center
  backgroundColor: #4CAF50

checkbox:
  label: "Remember me"
  checked: true
  align: center

link:
  label: "Forgot Password?"
  align: center

text:
  content: "This is a text element with automatic wrapping. It should wrap to multiple lines if the content is too long for a single line."
  width: 300
  fontSize: 16
  color: #333333
  align: center

image:
  url: "https://example.com/image.jpg"
  width: 200
  height: 150
  align: center

floatingActionButton:
  label: "+"
  backgroundColor: #FF4081
  align: right

margin:
  height: 20
  width: 300

bottomNavigationBar:
  backgroundColor: #ffffff
  children:
    - bottomNavigationItem:
        label: "Home"
        icon: 🏠
        active: true
    - bottomNavigationItem:
        label: "Search"
        icon: 🔍
    - bottomNavigationItem:
        label: "Profile"
        icon: 👤
    - bottomNavigationItem:
        label: "Settings"
        icon: ⚙️`;

// Parse the SLML
const parsedScreen = parseSLML(testSLML);

// Output the parsed result
console.log('Parsed Screen:', JSON.stringify(parsedScreen, null, 2));

// Check if all elements are parsed correctly
const elementTypes = [
  'appbar',
  'input',
  'button',
  'checkbox',
  'link',
  'text',
  'image',
  'floatingactionbutton',
  'margin',
  'bottomnavigationbar'
];

// Verify that all element types are present in the parsed screen
const parsedElementTypes = parsedScreen.elements.map(element => element.type.toLowerCase());
console.log('Parsed Element Types:', parsedElementTypes);

// Check if all expected element types are present
const missingElementTypes = elementTypes.filter(type => !parsedElementTypes.includes(type));
if (missingElementTypes.length > 0) {
  console.error('Missing Element Types:', missingElementTypes);
} else {
  console.log('All element types are parsed correctly!');
}

// Check if bottomNavigationBar has children
const bottomNavBar = parsedScreen.elements.find(el => el.type.toLowerCase() === 'bottomnavigationbar');
if (bottomNavBar && bottomNavBar.children && bottomNavBar.children.length > 0) {
  console.log('Success: BottomNavigationBar has ' + bottomNavBar.children.length + ' children');
  console.log('Children:', bottomNavBar.children);
} else {
  console.error('Error: BottomNavigationBar has no children or is missing');
}

// Process the SLML using processMarkdown
const screens = processMarkdown(testSLML);
console.log('Processed Screens:', JSON.stringify(screens, null, 2));