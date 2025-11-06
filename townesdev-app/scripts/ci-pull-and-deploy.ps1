<#
.SYNOPSIS
  Pulls the latest docs branch, builds the Docusaurus docs-site, zips the build, and deploys it via `deploy-docs.ps1`.

.DESCRIPTION
  Designed to run on the TSERVER (Windows) as a simple pull-and-deploy helper. It is idempotent and intended
  to be invoked by a human or a CI step that has access to the server (for example, a runner that SSHes into the host
  and executes this script). The script uses Git to update the working tree, runs `npm ci` and `npm run build`
  inside the `docs-site` folder, compresses the `build/` output and then calls `deploy-docs.ps1` to extract and restart the site service.

.PARAMETER RepoPath
  Path to the repository root (where `docs-site` lives). Default: current directory.

.PARAMETER Branch
  Git branch to checkout and pull (default: current branch or 'main').

.PARAMETER SitePath
  Destination folder for the deployed static site (e.g. C:\sites\townesdev-docs).

.PARAMETER ServiceName
  Optional Windows service name (NSSM or Windows service) to stop/start after deployment.

.PARAMETER NssmExe
  Optional path to nssm.exe; used by `deploy-docs.ps1` if provided.

.EXAMPLE
  .\ci-pull-and-deploy.ps1 -RepoPath C:\TownesDev\app\web\townesdev-app -Branch docs/cleanup/remove-legacy-uppercase -SitePath C:\sites\townesdev-docs -ServiceName TownesDevDocs -NssmExe C:\tools\nssm\nssm.exe
#>

param(
  [Parameter(Mandatory=$false)] [string] $RepoPath = (Get-Location).ProviderPath,
  [Parameter(Mandatory=$false)] [string] $Branch = '',
  [Parameter(Mandatory=$true)] [string] $SitePath,
  [Parameter(Mandatory=$false)] [string] $ServiceName = '',
  [Parameter(Mandatory=$false)] [string] $NssmExe = 'C:\tools\nssm\nssm.exe'
)

Set-StrictMode -Version Latest

function Fail($msg) {
  Write-Error $msg
  exit 1
}

Write-Host "Running pull/build/deploy from repo: $RepoPath"

if (-not (Test-Path $RepoPath)) { Fail "Repo path not found: $RepoPath" }

$DocsSite = Join-Path $RepoPath 'docs-site'
if (-not (Test-Path $DocsSite)) { Fail "docs-site folder not found at: $DocsSite" }

Push-Location $RepoPath
try {
  # Ensure git exists
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "git is not available on PATH." }

  # Determine branch: if not provided, use current branch
  if ([string]::IsNullOrEmpty($Branch)) {
    $Branch = (& git rev-parse --abbrev-ref HEAD).Trim()
    Write-Host "No branch supplied — using current branch: $Branch"
  } else {
    Write-Host "Checking out branch: $Branch"
    & git fetch origin $Branch --tags --prune
    & git checkout $Branch
    & git reset --hard origin/$Branch
  }

  Write-Host "Pulling latest changes..."
  & git pull origin $Branch

  # Build the docs-site
  Push-Location $DocsSite
  try {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm is not available on PATH. Install Node.js/npm." }
    Write-Host "Installing dependencies (npm ci)..."
    & npm ci --progress=false

    Write-Host "Building docs-site (npm run build)..."
    & npm run build
  } finally {
    Pop-Location
  }

  # Create artifact zip of build/
  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $tempDir = Join-Path $env:TEMP 'td-docs-deploy'
  if (-not (Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir | Out-Null }
  $artifact = Join-Path $tempDir "docs-site-build-$timestamp.zip"

  if (-not (Test-Path (Join-Path $DocsSite 'build'))) { Fail "No build output found at $DocsSite\build — build may have failed." }

  Write-Host "Creating artifact: $artifact"
  if (Test-Path $artifact) { Remove-Item $artifact -Force }
  Compress-Archive -Path (Join-Path $DocsSite 'build\*') -DestinationPath $artifact -Force

  # Call deploy-docs.ps1 which handles backup and service restart
  $deployScript = Join-Path $RepoPath 'scripts\deploy-docs.ps1'
  if (-not (Test-Path $deployScript)) { Fail "deploy-docs.ps1 not found at $deployScript" }

  $deployArgs = @(
    '-ArtifactZip', $artifact,
    '-SitePath', $SitePath
  )
  if (-not ([string]::IsNullOrEmpty($ServiceName))) { $deployArgs += @('-ServiceName', $ServiceName) }
  if (-not ([string]::IsNullOrEmpty($NssmExe))) { $deployArgs += @('-NssmExe', $NssmExe) }

  Write-Host "Invoking deploy script..."
  & $deployScript @deployArgs

  Write-Host "Pull/build/deploy completed successfully."
} catch {
  Fail "Error during pull/build/deploy: $_"
} finally {
  Pop-Location
}

exit 0
