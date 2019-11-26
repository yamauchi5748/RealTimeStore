@echo off
rem このファイルの場所をカレントディレクトリとする
cd /d %~dp0

rem コンテナにログイン
docker-compose exec socket bash