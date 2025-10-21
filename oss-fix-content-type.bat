@echo off
chcp 65001 >nul
echo ========================================
echo 阿里云OSS Content-Type 修复脚本
echo ========================================
echo.
echo 此脚本将修复已上传文件的Content-Type
echo.

REM 配置信息 - 请修改以下变量
set BUCKET_NAME=your-bucket-name

REM 检查ossutil是否存在
where ossutil64 >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到ossutil64命令
    echo 请先下载并配置ossutil: https://help.aliyun.com/document_detail/120075.html
    pause
    exit /b 1
)

echo [1/4] 修复HTML文件的Content-Type...
ossutil64 set-meta oss://%BUCKET_NAME%/ --include "*.html" --update Content-Type:text/html --recursive --force

echo.
echo [2/4] 修复CSS文件的Content-Type...
ossutil64 set-meta oss://%BUCKET_NAME%/ --include "*.css" --update Content-Type:text/css --recursive --force

echo.
echo [3/4] 修复JS文件的Content-Type...
ossutil64 set-meta oss://%BUCKET_NAME%/ --include "*.js" --update Content-Type:application/javascript --recursive --force

echo.
echo [4/4] 修复JSON文件的Content-Type...
ossutil64 set-meta oss://%BUCKET_NAME%/ --include "*.json" --update Content-Type:application/json --recursive --force

echo.
echo ========================================
echo Content-Type修复完成！
echo 请刷新浏览器重新访问
echo ========================================
pause




