param(
    [string]$InputDir = "./.storage/media/media/image/2026/04",
    [string]$OutputDir = "./.storage/webp",
    [int]$Quality = 80,
    [int]$CompressionLevel = 6
)

Write-Host "▶ Converting PNG → WebP..."
Write-Host "Input:  $InputDir"
Write-Host "Output: $OutputDir"

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Get PNG files only
$files = Get-ChildItem -Path $InputDir -Filter *.png -File

if ($files.Count -eq 0) {
    Write-Host "⚠ No PNG files found."
    exit
}

foreach ($file in $files) {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outputPath = Join-Path $OutputDir "$name.webp"

    Write-Host "→ $($file.Name) → $name.webp"

    ffmpeg -y -i "$($file.FullName)" `
        -c:v libwebp `
        -quality $Quality `
        -compression_level $CompressionLevel `
        "$outputPath" | Out-Null
}

Write-Host "✅ Done. Converted $($files.Count) files."