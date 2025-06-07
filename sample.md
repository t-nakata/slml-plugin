# SLML Plugin Sample

This is a sample Markdown file that demonstrates the SLML plugin in action.

## Account Creation Screen

Below is a simple account creation form:

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

## Login Screen

Here's a login screen:

```slml
Screen: ログイン
- Input: メールアドレス
- Input: パスワード
- Button: ログイン
- Link: パスワードを忘れた方はこちら
- Link: アカウント作成はこちら
```

## Profile Screen

Here's a profile screen:

```slml
Screen: プロフィール
- Input: 名前
- Input: 自己紹介
- Input: 場所
- Input: ウェブサイト
- Button: 保存
- Button: キャンセル
```

## Settings Screen

Here's a settings screen:

```slml
Screen: 設定
- Checkbox: 通知を受け取る
- Checkbox: ダークモード
- Checkbox: 位置情報を共有
- Button: 保存
- Button: キャンセル
- Link: アカウント削除
```

## Custom Size and Alignment

Here's a screen with custom size and element alignment:

```slml
Screen: アカウント作成 (width: 393, height: 852)
- Input: メールアドレス { align: center }
- Input: パスワード { align: left }
- Input: パスワード確認 { align: right }
- Button: 登録する { align: center }
- Link: ログインはこちら { align: center }
```

## Flutter UI Components

Here's a screen with Flutter UI components (Appbar, BottomNavigationBar, FloatingActionButton) and custom styling:

```slml
Screen: Flutter UI (width: 393, height: 852, backgroundColor: #f5f5f5)
- Appbar: My Flutter App { backgroundColor: #2196F3 }
- Input: Search... { align: center, padding: 20, backgroundColor: #ffffff }
- Button: Submit { align: center, backgroundColor: #4CAF50 }
- FloatingActionButton: + { align: right }
- BottomNavigationBar: Navigation { backgroundColor: #ffffff }
```

## Background Colors and Padding

Here's a screen demonstrating background colors and padding:

```slml
Screen: Styled UI (width: 393, height: 852, backgroundColor: #121212)
- Input: Dark Mode Input { backgroundColor: #333333, padding: 10 }
- Button: Dark Button { backgroundColor: #BB86FC, padding: 15 }
- Checkbox: Remember me { backgroundColor: #333333, padding: 10 }
- Link: Learn more { backgroundColor: #121212, padding: 20 }
```

## How It Works

The SLML plugin parses the SLML code blocks in this Markdown file and renders them as SVG diagrams. The syntax is simple:

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

Supported element types:
- Input
- Button
- Checkbox
- Link
- Appbar
- BottomNavigationBar
- FloatingActionButton

You can add more element types by extending the renderer.
