@echo off
title Smart Inventory Frontend (React)
echo ====================================================
echo Starting Smart Inventory Frontend UI...
echo ====================================================
cd /d %~dp0frontend
call "E:\Programs\nodejs\npm.cmd" run dev
pause
