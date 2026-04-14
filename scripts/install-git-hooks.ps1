param(
    [ValidateSet("public", "private")]
    [string]$Profile = "public"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksPath = Join-Path $repoRoot ".githooks\$Profile"

if (-not (Test-Path $hooksPath)) {
    Write-Error "Perfil de hooks não encontrado: $hooksPath"
    exit 1
}

& git config core.hooksPath ".githooks/$Profile"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao configurar core.hooksPath."
}

Write-Host "Hooks Git configurados para o perfil '$Profile'."
Write-Host "core.hooksPath = .githooks/$Profile"
