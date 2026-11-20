@echo off
chcp 65001 >nul
title SOATECH - Actualizar
cd /d "%~dp0"

echo ==========================================
echo    SOATECH - Descargando ultimos cambios
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [X] Git no esta instalado en este PC.
    echo     Descargalo de https://git-scm.com/download/win , instalalo y vuelve a abrir este archivo.
    echo.
    pause
    exit /b 1
)

if not exist ".git" (
    echo [X] Esta carpeta no es un repositorio de Git.
    echo     Clona el proyecto con:  git clone https://github.com/fcardozoarango/SOATECH-.git
    echo.
    pause
    exit /b 1
)

git diff --quiet
if errorlevel 1 (
    echo [!] Tienes cambios locales sin guardar en Git.
    echo     Se guardaran temporalmente ^(git stash^) para poder actualizar.
    git stash push -m "Respaldo automatico antes de actualizar" >nul
    set GUARDADO=1
)

git pull --ff-only
if errorlevel 1 (
    echo.
    echo [X] No se pudo actualizar automaticamente.
    echo     Revisa tu conexion a internet o pide ayuda con este mensaje.
    pause
    exit /b 1
)

if defined GUARDADO (
    git stash pop >nul 2>nul
    if errorlevel 1 (
        echo [!] Tus cambios locales quedaron guardados en "git stash" porque chocan con la actualizacion.
    ) else (
        echo [OK] Tus cambios locales se restauraron.
    )
)

echo.
echo [OK] Proyecto actualizado. Abriendo la demo...
start "" "%~dp0index.html"
timeout /t 3 >nul
exit /b 0
