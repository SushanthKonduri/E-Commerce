Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $fixed = $content -replace "from '(\.\./|\./)([^']+)\.js'", "from '`$1`$2'"
    Set-Content -Path $_.FullName -Value $fixed -NoNewline
    Write-Host "Fixed: $($_.Name)"
}
Write-Host "All imports fixed!"
