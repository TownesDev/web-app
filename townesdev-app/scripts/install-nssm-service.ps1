<#
Small helper to install an NSSM-backed Windows service that runs a static node server.

Usage (Admin PowerShell):
  .\install-nssm-service.ps1 -NssmExe C:\tools\nssm\nssm.exe -ServiceName TownesDevDocs -NodeExe C:\Program Files\nodejs\node.exe -ServeScriptPath C:\tools\serve.cmd -SitePath C:\sites\townesdev-docs -Port 3334

#>

param(
  [Parameter(Mandatory=$true)] [string] $NssmExe,
  [Parameter(Mandatory=$true)] [string] $ServiceName,
  [Parameter(Mandatory=$true)] [string] $NodeExe,
  [Parameter(Mandatory=$true)] [string] $ServeScriptPath,
  [Parameter(Mandatory=$true)] [string] $SitePath,
  [Parameter(Mandatory=$false)] [int] $Port = 3334
)

if (-not (Test-Path $NssmExe)) { throw "nssm not found at $NssmExe" }
if (-not (Test-Path $NodeExe)) { throw "node.exe not found at $NodeExe" }

$args = "`"$ServeScriptPath`" -s `"$SitePath`" -l $Port"

Write-Host "Installing service $ServiceName using $NssmExe"
& $NssmExe install $ServiceName $NodeExe $args

Write-Host "Setting AppDirectory to $SitePath"
& $NssmExe set $ServiceName AppDirectory $SitePath

Write-Host "Setting service to auto-start"
& $NssmExe set $ServiceName Start SERVICE_AUTO_START

Write-Host "Starting service"
& $NssmExe start $ServiceName

Write-Host "NSSM service $ServiceName installed and started."
