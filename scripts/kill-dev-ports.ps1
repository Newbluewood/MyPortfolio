# Stop listeners on dev ports (orphaned Cursor / background Node / uvicorn).
# Usage: .\kill-dev-ports.ps1 [-Target all|web|api]
param(
  [ValidateSet('all', 'web', 'api')]
  [string] $Target = 'all'
)

$ErrorActionPreference = 'SilentlyContinue'

$webPorts = @(3000)
$apiPorts = @(8020, 8001, 8000)
$ports = switch ($Target) {
  'web' { $webPorts }
  'api' { $apiPorts }
  Default { ($webPorts + $apiPorts) | Sort-Object -Unique }
}

foreach ($port in $ports) {
  if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      ForEach-Object {
        $procId = $_.OwningProcess
        if ($procId -gt 0) {
          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
      }
  }
}