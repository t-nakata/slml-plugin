# SLML Plugin

SLML (Screen Layout Markup Language) is a simple markup language for describing UI screens with various elements like inputs, buttons, checkboxes, etc. This plugin allows you to render SLML code blocks in Markdown as SVG diagrams.

## Features

- Parse SLML code blocks in Markdown
- Convert SLML to structured JSON data
- Render SLML as SVG diagrams
- Custom screen size specification
- Element alignment control (left, center, right)
- Background color customization for screens and elements
- Padding control between elements
- Support for various UI elements:
  - Input fields
  - Buttons
  - Checkboxes
  - Links
  - Appbar
  - BottomNavigationBar
  - FloatingActionButton
  - And more...

## SLML Syntax

SLML uses a simple syntax to describe UI screens:

```
Screen: Screen Title (width: W, height: H, backgroundColor: color)
- ElementType: Label { align: left|center|right, padding: N, backgroundColor: color }
- ElementType: Label
...
```

Where:
- `Screen: Screen Title` defines the title of the screen
- `(width: W, height: H, backgroundColor: color)` optionally specifies the screen dimensions and background color
- Each element is defined with a dash (`-`) followed by the element type, a colon (`:`), and the label
- Element properties are specified in curly braces `{ property: value, ... }`

Element properties:
- `align: left|center|right` - Specifies the element's horizontal alignment (default is `center`)
- `padding: N` - Specifies the padding above the element in pixels
- `backgroundColor: color` - Specifies the background color of the element

Alignment rules:
- `left`: Element is positioned at x = 16px from the left edge
- `center`: Element is centered horizontally (default)
- `right`: Element is positioned at x = (screenWidth - elementWidth - 16) from the left edge

Examples:

Basic example:

```slml
Screen: アカウント作成
- Input: メールアドレス
- Input: パスワード
- Input: パスワード確認
- Input: ユーザー名
- Checkbox: 利用規約に同意
- Button: アカウント作成
- Link: ログインはこちら
```

Example with screen size and element alignment:

```slml
Screen: アカウント作成 (width: 393, height: 852)
- Input: メールアドレス { align: center }
- Input: パスワード { align: left }
- Input: パスワード確認 { align: right }
- Button: 登録する { align: center }
- Link: ログインはこちら { align: center }
```

Example with Flutter UI components, background colors, and padding:

```slml
Screen: Flutter UI (width: 393, height: 852, backgroundColor: #f5f5f5)
- Appbar: My Flutter App { backgroundColor: #2196F3 }
- Input: Search... { align: center, padding: 20, backgroundColor: #ffffff }
- Button: Submit { align: center, backgroundColor: #4CAF50 }
- FloatingActionButton: + { align: right }
- BottomNavigationBar: Navigation { backgroundColor: #ffffff }
```

## Usage

### In Markdown

To use SLML in your Markdown files, simply create a code block with the `slml` language identifier:

````markdown
# My Document

Here's a UI screen:

```slml
Screen: Login
- Input: Username
- Input: Password
- Button: Login
- Link: Forgot Password?
```
````

### Integration

#### Web Integration

1. Include the SLML plugin scripts in your HTML:

```html
<script type="module" src="path/to/slml-plugin/parser.js"></script>
<script type="module" src="path/to/slml-plugin/renderer.js"></script>
```

2. Use the plugin to process Markdown content:

```javascript
import { replaceSLMLWithSVG } from './path/to/slml-plugin/renderer.js';

// Get Markdown content
const markdownContent = document.getElementById('markdown-content').value;

// Replace SLML code blocks with SVG
const processedMarkdown = replaceSLMLWithSVG(markdownContent);

// Display the processed Markdown
document.getElementById('preview').innerHTML = processedMarkdown;
```

#### JetBrains IDE Integration

For JetBrains IDE integration, you can create a plugin that:

1. Registers a language injector for SLML code blocks in Markdown
2. Provides a preview panel that renders the SLML as SVG
3. Updates the preview in real-time as you edit the Markdown

## Demo

A demo HTML page is included in the plugin. Open `index.html` in your browser to see the plugin in action.

## Development

### Project Structure

- `parser.ts` / `parser.js`: SLML parser implementation
- `renderer.ts` / `renderer.js`: SVG renderer implementation
- `index.html`: Demo page
- `README.md`: Documentation

### Building

If you make changes to the TypeScript files, you'll need to compile them to JavaScript:

```bash
# Using TypeScript compiler
tsc parser.ts --target es2015 --module es2015
tsc renderer.ts --target es2015 --module es2015
```

## License

MIT
