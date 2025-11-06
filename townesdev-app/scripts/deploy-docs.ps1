<#
.SYNOPSIS
  Deploys a zipped Docusaurus build artifact to a Windows host and restarts the site service.

.PARAMETER ArtifactZip
  Path to the zip file containing the site `build/` directory.

.PARAMETER SitePath
  Target directory where the site will be extracted (e.g. C:\sites\townesdev-docs).

.PARAMETER ServiceName
  NSSM/Windows service name to restart after deployment (optional).

.PARAMETER NssmExe
  Optional path to nssm.exe used to control the service.

Example:
  .\deploy-docs.ps1 -ArtifactZip C:\tmp\docs.zip -SitePath C:\sites\townesdev-docs -ServiceName TownesDevDocs -NssmExe C:\tools\nssm\nssm.exe
#>

param(
  [Parameter(Mandatory=$true)] [string] $ArtifactZip,
  [Parameter(Mandatory=$true)] [string] $SitePath,
  [Parameter(Mandatory=$false)] [string] $ServiceName,
  [Parameter(Mandatory=$false)] [string] $NssmExe = 'C:\tools\nssm\nssm.exe'
)

Write-Host "Deploying $ArtifactZip → $SitePath"

if (-not (Test-Path $ArtifactZip)) {
  Write-Error "Artifact not found: $ArtifactZip"
  exit 2
}

# Stop service if provided
if ($ServiceName) {
  if (-not (Test-Path $NssmExe)) {
    Write-Warning "nssm not found at $NssmExe — attempting Stop-Service for $ServiceName instead."
    try {
      Stop-Service -Name $ServiceName -Force -ErrorAction Stop
    } catch {
      Write-Warning "Could not stop service $ServiceName via Stop-Service: $_"
    }
  } else {
    & $NssmExe stop $ServiceName | Out-Null
  }
}

# Backup existing site (optional rotation)
$timestamp = (Get-Date -Format 'yyyyMMdd-HHmmss')
$backupDir = "$SitePath-backup-$timestamp"
if (Test-Path $SitePath) {
  Write-Host "Backing up existing site to $backupDir"
  Rename-Item -Path $SitePath -NewName $backupDir
}

# Recreate target folder
New-Item -ItemType Directory -Path $SitePath -Force | Out-Null

Write-Host "Extracting artifact..."
Expand-Archive -Path $ArtifactZip -DestinationPath $SitePath -Force

# Ensure permissions are reasonable (give IIS_IUSRS read access if needed)
try {
  $acl = Get-Acl $SitePath
  $rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS","ReadAndExecute","ContainerInherit, ObjectInherit","None","Allow")
  $acl.AddAccessRule($rule)
  Set-Acl -Path $SitePath -AclObject $acl
} catch {
  Write-Host "Permission set step skipped or failed: $_"
}

# Start service if provided
if ($ServiceName) {
  if (-not (Test-Path $NssmExe)) {
    try {
      Start-Service -Name $ServiceName -ErrorAction Stop
    } catch {
      Write-Warning "Could not start service $ServiceName via Start-Service: $_"
    }
  } else {
    & $NssmExe start $ServiceName | Out-Null
  }
}

Write-Host "Deployment complete. Site available from: $SitePath"
