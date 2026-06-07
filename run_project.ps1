Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  GlowCare Cosmiatria v3.0.0 - Iniciando..."    -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# ───────────────────────────────────────────────
# 1. BACKEND: crear venv e instalar dependencias si no existen
# ───────────────────────────────────────────────
$venvDir = Join-Path $backendDir "venv"
$activatePs = Join-Path $venvDir 'Scripts\Activate.ps1'

if (-Not (Test-Path $activatePs)) {
    Write-Host "[Backend] Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv "$venvDir"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[Backend] ERROR: No se pudo crear el venv. Asegurate de tener Python instalado." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "[Backend] Entorno virtual creado." -ForegroundColor Green

    Write-Host "[Backend] Instalando dependencias (requirements.txt)..." -ForegroundColor Yellow
    $pipExe = Join-Path $venvDir 'Scripts\pip.exe'
    $reqFile = Join-Path $backendDir 'requirements.txt'
    & $pipExe install -r $reqFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[Backend] ERROR: Fallo la instalacion de dependencias." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host "[Backend] Dependencias instaladas." -ForegroundColor Green
} else {
    Write-Host "[Backend] Entorno virtual encontrado." -ForegroundColor Green
}

# ───────────────────────────────────────────────
# 2. FRONTEND: instalar node_modules si no existen
# ───────────────────────────────────────────────
$nodeModules = Join-Path $frontendDir "node_modules"

if (-Not (Test-Path $nodeModules)) {
    Write-Host "[Frontend] Instalando dependencias (npm install)..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[Frontend] ERROR: Fallo npm install. Asegurate de tener Node.js instalado." -ForegroundColor Red
        Pop-Location
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Pop-Location
    Write-Host "[Frontend] Dependencias instaladas." -ForegroundColor Green
} else {
    Write-Host "[Frontend] node_modules encontrado." -ForegroundColor Green
}

# ───────────────────────────────────────────────
# 3. Iniciar servidores en ventanas separadas
# ───────────────────────────────────────────────
Write-Host ""
Write-Host "[Servidor] Iniciando Backend (Django) y Frontend (Vite)..." -ForegroundColor Cyan

$backendCmd = "cd '$backendDir'; & '.\venv\Scripts\Activate.ps1'; python manage.py runserver"
Start-Process powershell -ArgumentList "-NoExit -Command $backendCmd"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$frontendDir'; npm run dev`""

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Servidores iniciados en nuevas ventanas" -ForegroundColor Green
Write-Host "  Backend:  http://127.0.0.1:8000"        -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000"         -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
