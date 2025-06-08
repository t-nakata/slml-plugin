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
- Text wrapping with custom width and font size
- Image sizing and alignment
- Material Design 3テーマサポート
- レスポンシブレイアウト対応
- インタラクション・アニメーション定義
- Support for various UI elements:
  - Input fields
  - Buttons
  - Checkboxes
  - Links
  - Text with automatic wrapping
  - Images
  - Appbar (with back button, centered title, and action icons)
  - BottomNavigationBar (with items and icons)
  - FloatingActionButton
  - Margin (for spacing)
  - Tabs (タブナビゲーション)
  - Chips (チップ)
  - Snackbar (スナックバー)
  - Dialog (ダイアログ)
  - Progress indicators (進行状況インジケーター)
  - Slider (スライダー)
  - Date & Time pickers (日付・時間選択)
  - Radio buttons (ラジオボタン)
  - Switch (スイッチ)
  - Badge (バッジ)
  - Expansion panel (展開パネル)
  - Navigation drawer (ナビゲーションドロワー)

## SLML Syntax

SLML supports two syntax formats: the original dash-based syntax and a new indented syntax.

### Original Syntax

The original syntax uses dashes to define elements and curly braces for properties:

```
Screen: Screen Title (width: W, height: H, backgroundColor: color)
- ElementType: Label { align: left|center|right, padding: N, backgroundColor: color, ...other properties }
- ElementType: Label
...
```

Where:
- `Screen: Screen Title` defines the title of the screen
- `(width: W, height: H, backgroundColor: color)` optionally specifies the screen dimensions and background color
- Each element is defined with a dash (`-`) followed by the element type, a colon (`:`), and the label
- Element properties are specified in curly braces `{ property: value, ... }`

### New Indented Syntax

The new syntax uses indentation to define properties and child elements, with sections separated by `---`:

```
# Screen Title
screen:
    title: "Screen Title"
    size: W, H
    backgroundColor: color
---
elementType:
    property1: value1
    property2: value2
    children:
        - childElementType:
            property1: value1
            property2: value2
---
anotherElementType:
    property1: value1
    property2: value2
```

Where:
- The first line can optionally start with `#` followed by a comment (often used for the screen title)
- The first section typically defines the screen properties
- Each section is separated by `---`
- Element properties are indented under the element type
- Child elements are indented under a `children:` property
- Actions (like in AppBar) are defined under an `actions:` property

### Common Element Properties

これらのプロパティは多くの要素でサポートされています：

- `align: left|center|right` - 要素の水平方向の配置を指定します（デフォルトは `center`）
- `backgroundColor: color` - 要素の背景色を指定します
- `children` - 子要素のリストを含むことができます

配置ルール：
- `left`: 要素は左端からx = 16pxの位置に配置されます
- `center`: 要素は水平方向に中央揃えされます（デフォルト）
- `right`: 要素は左端からx = (screenWidth - elementWidth - 16)の位置に配置されます

### Element-Specific Properties

#### Text
- `width`: Maximum width of the text block in pixels
- `fontSize`: Font size in pixels (default: 14)
- `color`: Text color (default: #212529)

#### Image
- `width`: Width of the image in pixels
- `height`: Height of the image in pixels

#### Appbar
- `backgroundColor`: Background color of the app bar (default: #2196F3)
- `showBackButton`: Whether to show a back button on the left side (true/false)
- `centerTitle`: Whether to center the title text (true/false)
- `actionIcons`: A pipe-separated list of icons to display on the right side (e.g., "🔍|⚙️|👤")

#### BottomNavigationBar
- `backgroundColor`: Background color of the navigation bar (default: #f8f9fa)
- Can contain child items, each with:
  - `active`: Whether the item is active/selected (true/false)
  - `icon`: An icon to display above the label

#### FloatingActionButton
- `backgroundColor`: Background color of the button (default: #FF4081)

#### Margin
- `width`: Width of the margin in pixels
- `height`: Height of the margin in pixels

#### Tabs
- `variant`: タブの表示タイプ (fixed/scrollable)
- `selectedIndex`: 選択されているタブのインデックス
- `labels`: タブのラベルリスト (パイプ区切り e.g. "タブ1|タブ2|タブ3")

#### Chips
- `type`: チップのタイプ (assist/filter/input/suggestion)
- `selected`: 選択状態 (true/false)
- `icon`: チップに表示するアイコン
- `onDelete`: 削除可能かどうか (true/false)

#### Snackbar
- `message`: スナックバーに表示するメッセージ
- `action`: アクションボタンのテキスト
- `duration`: 表示時間（ミリ秒）

#### Dialog
- `title`: ダイアログのタイトル
- `content`: ダイアログの内容
- `actions`: アクションボタンのリスト (パイプ区切り e.g. "キャンセル|OK")

#### ProgressIndicator
- `type`: インジケーターのタイプ (linear/circular)
- `determinate`: 決定的または不確定 (true/false)
- `value`: 進行状況の値 (0.0〜1.0)
- `color`: インジケーターの色

#### Slider
- `min`: 最小値
- `max`: 最大値
- `value`: 現在の値
- `step`: ステップ値

#### DatePicker
- `initialDate`: 初期日付
- `format`: 日付の表示フォーマット
- `mode`: 表示モード (calendar/spinner)

#### TimePicker
- `initialTime`: 初期時間
- `format`: 時間の表示フォーマット (12h/24h)

#### RadioButton
- `group`: ラジオボタンのグループ名
- `selected`: 選択状態 (true/false)

#### Switch
- `checked`: オン/オフ状態 (true/false)

#### Badge
- `value`: バッジに表示する値
- `color`: バッジの色
- `position`: バッジの位置 (topRight/topLeft/bottomRight/bottomLeft)

#### ExpansionPanel
- `expanded`: 展開状態 (true/false)
- `title`: パネルのタイトル

#### NavigationDrawer
- `variant`: ドロワーのタイプ (modal/standard)
- `items`: ドロワー内の項目リスト

## Advanced Features

### Theme Support

SLMLはMaterial Design 3のテーマシステムをサポートしています：

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

Example with text wrapping and custom font properties:

```slml
Screen: Text Example (width: 393, height: 852, backgroundColor: #f5f5f5)
- Text: This is a long text that will automatically wrap to multiple lines based on the available width. { width: 300, fontSize: 16, color: #333333 }
```

Example with Flutter UI components, background colors, and padding:

```slml
Screen: Flutter UI (width: 393, height: 852, backgroundColor: #f5f5f5)
- Appbar: My Flutter App { backgroundColor: #2196F3, centerTitle: true, showBackButton: true, actionIcons: 🔍|⚙️ }
- Input: Search... { align: center, padding: 20, backgroundColor: #ffffff }
- Button: Submit { align: center, backgroundColor: #4CAF50 }
- FloatingActionButton: + { align: right }
- BottomNavigationBar: Navigation { backgroundColor: #ffffff }
```

### New Indented Syntax Examples

User profile example:

```slml
# ユーザープロフィール画面
screen:
    title: "プロフィール"
    size: 360, 740
---
appbar:
    title: "My Profile"
    navIcon: "arrow_back"
    actions:
        - icon: "edit"
---
card:
    children:
        - listitem:
            leading:
                icon: "person"
            primaryText: "田中 太郎"
            secondaryText: "プロジェクトマネージャー"
        - divider:
        - text:
            content: "進捗管理とチームの調整を担当しています。趣味は週末のキャンプです。"
---
button:
    label: "アカウント設定"
    style: "filled"
    leadingIcon: "settings"
```

Login form example:

```slml
# ログインフォーム
screen:
    title: "ログイン"
    size: 360, 640
    backgroundColor: "#f5f5f5"
---
appbar:
    title: "ログイン"
    centerTitle: true
---
text:
    content: "アカウント情報を入力してください"
    align: center
---
input:
    label: "メールアドレス"
    align: center
---
input:
    label: "パスワード"
    align: center
---
button:
    label: "ログイン"
    style: "filled"
    align: center
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
