@echo off
title Smart Inventory Backend (Spring Boot)
echo ====================================================
echo Starting Smart Inventory Backend on Port 8080...
echo ====================================================
set "JAVA_HOME=%~dp0tools\jdk-21.0.6+7"
set "PATH=%JAVA_HOME%\bin;%~dp0tools\apache-maven-3.9.6\bin;%PATH%"
cd /d %~dp0backend
call "%~dp0tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
pause
