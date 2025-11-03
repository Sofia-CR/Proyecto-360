@echo off
cd /d "C:\laragon\www\Proyecto360"
echo [%date% %time%] Inicio scheduler >> "storage\logs\tareas.log"
"C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" artisan schedule:run >> "storage\logs\tareas.log" 2>&1
echo [%date% %time%] Fin scheduler >> "storage\logs\tareas.log"