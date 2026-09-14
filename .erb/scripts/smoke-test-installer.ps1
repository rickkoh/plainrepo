# Silently installs the Windows installer from release/build and smoke tests
# the installed app. Used in CI on Windows runners.
#
# Usage: ./.erb/scripts/smoke-test-installer.ps1
$ErrorActionPreference = 'Stop'

$installer = Get-ChildItem release/build/*-Setup-*.exe | Select-Object -First 1
if (-not $installer) {
  throw 'No installer found in release/build'
}

Write-Host "Installing $($installer.Name)"
$process = Start-Process -FilePath $installer.FullName -ArgumentList '/S' -Wait -PassThru
Write-Host "Installer exited with code $($process.ExitCode)"

# The installer can hand off to a child process and exit before the install
# finishes, so wait for the app and its uninstaller (written last) to appear
$installDirs = @(
  "$env:LOCALAPPDATA\Programs\plainrepo",
  "$env:ProgramFiles\PlainRepo"
)
$deadline = (Get-Date).AddMinutes(3)
$appPath = $null

while (-not $appPath -and (Get-Date) -lt $deadline) {
  foreach ($dir in $installDirs) {
    $exe = Join-Path $dir 'PlainRepo.exe'
    $uninstaller = Join-Path $dir 'Uninstall PlainRepo.exe'
    if ((Test-Path $exe) -and (Test-Path $uninstaller)) {
      $appPath = $exe
      break
    }
  }
  if (-not $appPath) {
    Start-Sleep -Seconds 5
  }
}

if (-not $appPath) {
  Write-Host 'Contents of the per-user programs folder:'
  Get-ChildItem "$env:LOCALAPPDATA\Programs" -ErrorAction SilentlyContinue |
    ForEach-Object { Write-Host "  $($_.FullName)" }
  throw 'PlainRepo was not installed'
}

Write-Host "Installed to $appPath"
node .erb/scripts/smoke-test.js $appPath
exit $LASTEXITCODE
