@echo off
chcp 65001 >nul
title SOATECH - Abrir demo
cd /d "%~dp0"

if not exist "index.html" (
    echo No se encontro index.html en esta carpeta.
    echo Asegurate de que este archivo .bat este dentro de la carpeta del proyecto SOATECH.
    pause
    exit /b 1
)

rem Abre la demo en el navegador predeterminado. No necesita internet ni instalar nada.
start "" "%~dp0index.html"
exit /b 0
