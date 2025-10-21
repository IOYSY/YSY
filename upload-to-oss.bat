@echo off
chcp 65001 >nul
echo ========================================
echo 阿里云OSS自动上传脚本
echo ========================================
echo.

REM 配置信息 - 请修改以下变量
set BUCKET_NAME=your-bucket-name
set ENDPOINT=oss-cn-hangzhou.aliyuncs.com

REM 检查ossutil是否存在
where ossutil64 >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到ossutil64命令
    echo 请先下载并配置ossutil: https://help.aliyun.com/document_detail/120075.html
    pause
    exit /b 1
)

echo [1/5] 上传HTML文件...
for /r %%f in (*.html) do (
    echo 上传: %%f
    ossutil64 cp "%%f" oss://%BUCKET_NAME%/%%~nxf --meta Content-Type:text/html --force
)

echo.
echo [2/5] 上传CSS文件...
for /r %%f in (*.css) do (
    echo 上传: %%f
    ossutil64 cp "%%f" oss://%BUCKET_NAME%/%%~nxf --meta Content-Type:text/css --force
)

echo.
echo [3/5] 上传JS文件...
for /r %%f in (*.js) do (
    echo 上传: %%f
    ossutil64 cp "%%f" oss://%BUCKET_NAME%/%%~nxf --meta Content-Type:application/javascript --force
)

echo.
echo [4/5] 上传JSON文件...
for /r %%f in (*.json) do (
    echo 上传: %%f
    ossutil64 cp "%%f" oss://%BUCKET_NAME%/%%~nxf --meta Content-Type:application/json --force
)

echo.
echo [5/5] 上传Markdown文件...
for /r %%f in (*.md) do (
    echo 上传: %%f
    ossutil64 cp "%%f" oss://%BUCKET_NAME%/%%~nxf --meta Content-Type:text/markdown --force
)

echo.
echo ========================================
echo 上传完成！
echo 访问地址: http://%BUCKET_NAME%.%ENDPOINT%/index.html
echo ========================================
pause




