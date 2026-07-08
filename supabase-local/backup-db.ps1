# Local Postgres backup scaffold for the Mangalist self-hosted Supabase stack.
#
# This is a LOCAL-ONLY dev backup (dump written to ./backups next to this script),
# not a production disaster-recovery solution. Once AWS deployment is a separate,
# explicitly approved decision, this should be replaced/supplemented with a
# scheduled pg_dump -> S3 job (see the CIO recommendation logged in
# ceo/finance.md). Having *something* now beats having nothing until then.
#
# Dumps in plain SQL text format (pg_dump default) rather than the binary custom
# format (-Fc) -- avoids any risk of PowerShell's text-mode redirection mangling
# binary output, and plain SQL is human-readable/diffable for a small local DB.
#
# Usage (from supabase-local/, with `npx supabase start` already running):
#   ./backup-db.ps1
#
# Restore (destructive -- overwrites current local data):
#   Get-Content backups/<file>.sql -Raw | docker exec -i supabase_db_supabase-local psql -U postgres -d postgres

$ErrorActionPreference = "Stop"

# Container name follows the Supabase CLI convention: supabase_db_<project_id>,
# where project_id comes from supabase/config.toml (currently "supabase-local").
$containerName = "supabase_db_supabase-local"
$dbUser = "postgres"
$dbName = "postgres"

$backupDir = Join-Path $PSScriptRoot "backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $backupDir "mangalist-local-$timestamp.sql"

Write-Host "Checking container '$containerName' is running..."
$running = docker ps --filter "name=$containerName" --format "{{.Names}}"
if (-not $running) {
    Write-Error "Container '$containerName' is not running. Start the stack first: cd supabase-local; npx supabase start"
    exit 1
}

Write-Host "Dumping database to $outFile ..."
docker exec $containerName pg_dump -U $dbUser -d $dbName --no-owner --no-privileges | Out-File -FilePath $outFile -Encoding utf8

if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed (exit code $LASTEXITCODE)."
    exit $LASTEXITCODE
}

Write-Host "Backup complete: $outFile"
Write-Host "Restore with:"
Write-Host "  Get-Content `"$outFile`" -Raw | docker exec -i $containerName psql -U $dbUser -d $dbName"
