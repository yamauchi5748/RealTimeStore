@echo off
rem このファイルの場所をカレントディレクトリとする
cd /d %~dp0

rem 各コンテナを停止
docker-compose down