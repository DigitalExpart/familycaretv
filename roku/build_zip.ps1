Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = "c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku"
$zipPath = Join-Path $root "FamilyCareTV_Roku.zip"

# Remove old zip
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Create new zip
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

# Add all files from these folders
$folders = @('components', 'images', 'locale', 'source')
foreach ($folder in $folders) {
    $folderPath = Join-Path $root $folder
    if (Test-Path $folderPath) {
        Get-ChildItem -Path $folderPath -Recurse -File | ForEach-Object {
            $entryName = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entryName) | Out-Null
            Write-Host "  Added: $entryName"
        }
    }
}

# Add manifest at root level
$manifestPath = Join-Path $root "manifest"
if (Test-Path $manifestPath) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $manifestPath, "manifest") | Out-Null
    Write-Host "  Added: manifest"
}

$zip.Dispose()

# Verify
Write-Host ""
Write-Host "=== ZIP CREATED SUCCESSFULLY ==="
$fileInfo = Get-Item $zipPath
Write-Host "File: $zipPath"
Write-Host "Size: $([math]::Round($fileInfo.Length / 1KB, 1)) KB"

$verifyZip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "Total entries: $($verifyZip.Entries.Count)"
Write-Host ""
Write-Host "=== CONTENTS ==="
$verifyZip.Entries | ForEach-Object { Write-Host $_.FullName }
$verifyZip.Dispose()
