@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ============================================================
echo   CMS Layout Builder - Tauri Build Script
echo ============================================================
echo.

cd /d "%~dp0tauri-app"

:: ============================================================
:: Step 1: Check Node.js
:: ============================================================
echo [1/6] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js が見つかりません。
    echo https://nodejs.org/ からインストールしてください。
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo       Node.js %%v

:: ============================================================
:: Step 2: Check / Install Rust
:: ============================================================
echo.
echo [2/6] Checking Rust...
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
where rustc >nul 2>&1
if %errorlevel% neq 0 (
    echo       Rust not found. Starting installation...
    echo.
    echo       Downloading rustup...

    :: Download rustup-init.exe
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile '%TEMP%\rustup-init.exe' }"

    if not exist "%TEMP%\rustup-init.exe" (
        echo ERROR: failed to download rustup.
        echo Please install it manually from https://rustup.rs/
        pause
        exit /b 1
    )

    echo       Installing rustup - this may take a few minutes...
    "%TEMP%\rustup-init.exe" -y --default-toolchain stable

    :: Reload PATH
    call "%USERPROFILE%\.cargo\env.bat" 2>nul
    set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

    where rustc >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: PATH was not updated after Rust installation.
        echo Please restart your terminal/command prompt and run build.bat again.
        pause
        exit /b 1
    )
    echo       Rust installation completed.
)
for /f "tokens=*" %%v in ('rustc --version') do echo       %%v
for /f "tokens=*" %%v in ('cargo --version') do echo       %%v

:: ============================================================
:: Step 3: Install npm dependencies
:: ============================================================
echo.
echo [3/6] npm install...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install に失敗しました。
    pause
    exit /b 1
)
echo       npm dependencies installed.

:: ============================================================
:: Step 4: Generate icons
:: ============================================================
echo.
echo [4/6] Generating icons...
if not exist "src-tauri\icons\icon.ico" (
    node generate-icon.js
    if %errorlevel% neq 0 (
        echo WARNING: アイコン生成に失敗しましたが、ビルドは続行します。
    )
) else (
    echo       Icons already exist, skipping.
)

:: ============================================================
:: Step 5: Build with Tauri
:: ============================================================
echo.
echo [5/6] Building Tauri application...
echo       (初回ビルドは Rust クレートのダウンロードとコンパイルに
echo        10-20分程度かかります。お待ちください...)
echo.

call npx tauri build 2>&1

if %errorlevel% neq 0 (
    echo.
    echo WARNING: Tauri ビルドでエラーが発生しました。
    echo         ログを確認してください。
    echo.
    rem Even if bundle fails, the .exe might still exist
)

:: ============================================================
:: Step 6: Locate and copy the output binary
:: ============================================================
echo.
echo [6/6] Locating output binary...

set "EXE_PATH=src-tauri\target\release\cms-layout-builder.exe"
set "OUTPUT_DIR=%~dp0dist"

if exist "%EXE_PATH%" (
    if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
    copy /y "%EXE_PATH%" "%OUTPUT_DIR%\CMSLayoutBuilder.exe" >nul
    echo.
    echo ============================================================
    echo   BUILD SUCCESSFUL!
    echo ============================================================
    echo.
    echo   Output: %OUTPUT_DIR%\CMSLayoutBuilder.exe
    echo.
    for %%A in ("%OUTPUT_DIR%\CMSLayoutBuilder.exe") do (
        echo   Size: %%~zA bytes
    )
    echo.
    echo   このファイル単体で動作します。
    echo   ダブルクリックで起動してください。
    echo ============================================================
) else (
    :: Check for NSIS installer
    set "FOUND_INSTALLER="
    for /r "src-tauri\target\release\bundle" %%f in (*.exe) do (
        if not defined FOUND_INSTALLER (
            set "FOUND_INSTALLER=%%f"
        )
    )
    if defined FOUND_INSTALLER (
        if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
        copy /y "!FOUND_INSTALLER!" "%OUTPUT_DIR%\CMSLayoutBuilder-Setup.exe" >nul
        echo.
        echo ============================================================
        echo   BUILD SUCCESSFUL ^(Installer^)
        echo ============================================================
        echo.
        echo   Installer: %OUTPUT_DIR%\CMSLayoutBuilder-Setup.exe
        echo.
        echo ============================================================
    ) else (
        echo.
        echo ERROR: ビルド成果物が見つかりませんでした。
        echo       上記のエラーログを確認してください。
        echo.
    )
)

echo.
pause
