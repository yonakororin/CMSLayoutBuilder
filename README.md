# CMS Layout Builder

CMS のレイアウトを視覚的に構築・編集するためのアプリケーションです。
Vue 3 + Vite で構築されており、Tauri を用いて Windows 向けの単一実行ファイル (.exe) としてビルドすることができます。

## 📸 デスクトップアプリとしてのビルド方法 (Tauri)

プロジェクトルートにある `build.bat` を実行することで、Tauri でパッケージングされた単一の `.exe` ファイルを作成できます。

### ⚠️ 必須要件 (Build Requirements)

Tauri で Windows 向けアプリをビルドするには、以下の**Microsoft C++ Build Tools** がシステムにインストールされている必要があります。

1. **[Visual Studio Build Tools のダウンロード](https://visualstudio.microsoft.com/ja/visual-cpp-build-tools/)** にアクセスします。
2. インストーラー (`vs_buildtools.exe`) をダウンロードして実行します。
3. ワークロードの選択画面で **「C++ によるデスクトップ開発 (Desktop development with C++)」** にチェックを入れます。
4. インストールを実行します（数GBの容量と時間がかかります）。
5. インストール完了後、**コンピューターを再起動**（またはターミナルソフトウェアを再起動）してください。

※ C++ ビルドツール（特に `link.exe`）が存在しない場合、Rust のコンパイルフェーズで以下のようなエラーが発生します。
> `error: linker 'link.exe' not found`

### 🚀 ビルド手順

必須要件を満たした状態で、以下の手順を実行します。

1. コマンドプロンプトまたは PowerShell を開きます。
2. このプロジェクトのルートフォルダ (`c:\Projects\CMSLayoutBuilder`) に移動します。
3. `build.bat` を実行します。

```bat
cd C:\Projects\CMSLayoutBuilder
.\build.bat
```

バッチファイルは以下の処理を自動で行います：
1. **Node.js チェック**
2. **Rust / rustup の自動インストール** (未インストールの場合)
3. フロントエンド依存関係のインストール (`npm install`)
4. アイコン生成 (PNG / ICO の自動作成)
5. **Tauri ビルド** (初回のコンパイルにはお使いのPC性能により数分〜十分以上かかります)

ビルドが完了すると、`dist/` フォルダに `CMSLayoutBuilder-Setup.exe` または `CMSLayoutBuilder.exe` が出力されます。

---

## 💻 開発環境としての実行 (Web プレビュー用)

実行ファイル化せずに、コードを書きながらブラウザで動作確認をしたい場合は、以下のコマンドを実行します。

```bash
cd tauri-app
npm install
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセスすると、ホットリロード対応の開発サーバーでアプリの動作を確認できます。

## 🎯 主な機能
- **ポータルページ構築**: ドラッグ＆ドロップによるカードの並び替え・管理。
- **メニューページ構築**: 左ペインのメニュー一覧と右ペインのコンポーネントキャンバス。
- **コンポーネント配置**: HTML、テキスト入力、セレクトボックス等の要素をキャンバス上に配置可能。
- **ローカルファイル保存/読込**: File System Access API を用いたプロジェクト全体の JSON 保存機能。
