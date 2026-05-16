Write-Host "Iniciando Proyecto Cosmiátrico Django REST + React..."
Write-Host "==========================="

Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver`""
Wait-Event -Timeout 2
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "Servidores iniciados en nuevas ventanas." 
