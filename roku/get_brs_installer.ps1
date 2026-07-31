$html = & curl.exe -s -L -A "Mozilla/5.0" "https://github.com/lvcabral/brs-desktop/releases/latest"
$matches = [regex]::Matches($html, 'href="(/lvcabral/brs-desktop/releases/download/[^"]+?\.exe)"')
foreach ($m in $matches) {
    Write-Host "FOUND LINK: https://github.com$($m.Groups[1].Value)"
}
