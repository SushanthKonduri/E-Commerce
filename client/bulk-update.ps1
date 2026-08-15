# Bulk replace $ currency signs with ₹ in all client TSX/TS files
# Also replace LUXE with VELORA in footer and admin layout

$clientSrc = "E:\New Projects\client\src"

Get-ChildItem -Path $clientSrc -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw -Encoding UTF8

    # Replace dollar amount patterns: $X.XX → ₹X.XX (e.g. $349.99 → ₹349.99)
    $updated = $content -replace '\$\{([^}]+)\.toFixed\(2\)\}', '₹{$1.toFixed(2)}'
    
    # Replace hardcoded $ strings like "$50" "$2,000+" in text
    $updated = $updated -replace '"\$50"', '"₹50"'
    $updated = $updated -replace '"\$2,000\+"', '"₹2,000+"'
    $updated = $updated -replace '"\$150"', '"₹150"'
    
    # Replace LUXE branding in footer and admin (not CSS color classes like luxe-gold)
    $updated = $updated -replace '(?<![a-z-])LUXE(?![-a-z])', 'VELORA'
    $updated = $updated -replace 'Luxe E-Commerce', 'Velora'
    $updated = $updated -replace 'Luxe Commerce Platform', 'VELORA'
    $updated = $updated -replace 'LUXE Commerce Platform', 'VELORA'
    $updated = $updated -replace 'luxe-ecommerce-client', 'velora-client'
    $updated = $updated -replace 'Aesthetic Store', 'Premium Essentials'
    $updated = $updated -replace 'admin@luxe\.com', 'admin@velora.com'
    $updated = $updated -replace 'sophia@example\.com', 'demo@velora.com'
    
    # Replace price filter text "$50" and "$2,000+" spans
    $updated = $updated -replace '<span>\$50</span>', '<span>₹50</span>'
    $updated = $updated -replace '<span>\$2,000\+</span>', '<span>₹2,000+</span>'
    
    if ($updated -ne $content) {
        Set-Content -Path $file -Value $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($_.Name)"
    }
}

Write-Host "Currency and branding replacement complete!"
