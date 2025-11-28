@echo off
REM Script para ejecutar la migración de base de datos
REM Fecha: 2025-11-28

set PGPASSWORD=Allisson1412*
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d inventario_db -f add_assignment_fields.sql

pause
