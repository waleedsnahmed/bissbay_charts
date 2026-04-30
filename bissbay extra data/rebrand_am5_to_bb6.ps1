# Bissbay Rebranding Script - Phase 2
# Replaces all am5/amcharts5/amcharts variable names and references with bb6/bissbay/bissbay5
# Target directories: @bissbay/bissbay-charts and @bissbay/bissbay-geodata

$ErrorActionPreference = "Continue"

$basePath = "d:\Bissbay\new-data-bissbay\Bissbay_2026\@bissbay"
$dirs = @("$basePath\bissbay-charts", "$basePath\bissbay-geodata")

$totalFiles = 0
$modifiedFiles = 0

foreach ($dir in $dirs) {
    Write-Host "`n===== Processing: $dir =====" -ForegroundColor Cyan
    
    if (-not (Test-Path $dir)) {
        Write-Host "  [SKIP] Directory not found: $dir" -ForegroundColor Red
        continue
    }

    # Process all text-based files
    $extensions = @("*.js", "*.ts", "*.d.ts", "*.js.map", "*.d.ts.map", "*.json", "*.md")
    
    foreach ($ext in $extensions) {
        $files = Get-ChildItem -Path $dir -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $totalFiles++
            
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($null -eq $content) { continue }
            
            # Check if file contains any patterns we need to replace
            if ($content -match 'am5|amcharts|amCharts|amchart|amChart|@Bissbay/Bissbay5|Bissbay5') {
                $originalContent = $content
                
                # ===== Fix import paths first (most specific patterns first) =====
                
                # Fix incorrectly cased import paths from previous rebrand
                # @Bissbay/Bissbay5-geodata -> @bissbay/bissbay-geodata
                $content = $content -replace '@Bissbay/Bissbay5-geodata', '@bissbay/bissbay-geodata'
                # @Bissbay/Bissbay5 -> @bissbay/bissbay-charts
                $content = $content -replace '@Bissbay/Bissbay5', '@bissbay/bissbay-charts'
                
                # Fix any remaining amcharts import paths
                $content = $content -replace '@amcharts/amcharts5-geodata', '@bissbay/bissbay-geodata'
                $content = $content -replace '@amcharts/amcharts5', '@bissbay/bissbay-charts'
                
                # ===== Replace variable names: am5 -> bb6 =====
                
                # Replace am5themes_ prefix (e.g., am5themes_Animated -> bb6themes_Animated)
                $content = $content -replace '\bam5themes_', 'bb6themes_'
                
                # Replace am5stock prefix  
                $content = $content -replace '\bam5stock\b', 'bb6stock'
                $content = $content -replace '\bam5stock\.', 'bb6stock.'
                
                # Replace am5map prefix
                $content = $content -replace '\bam5map\b', 'bb6map'
                $content = $content -replace '\bam5map\.', 'bb6map.'
                
                # Replace am5xy prefix
                $content = $content -replace '\bam5xy\b', 'bb6xy'
                $content = $content -replace '\bam5xy\.', 'bb6xy.'
                
                # Replace am5percent prefix
                $content = $content -replace '\bam5percent\b', 'bb6percent'
                $content = $content -replace '\bam5percent\.', 'bb6percent.'
                
                # Replace am5radar prefix
                $content = $content -replace '\bam5radar\b', 'bb6radar'
                $content = $content -replace '\bam5radar\.', 'bb6radar.'
                
                # Replace am5hierarchy prefix
                $content = $content -replace '\bam5hierarchy\b', 'bb6hierarchy'
                $content = $content -replace '\bam5hierarchy\.', 'bb6hierarchy.'
                
                # Replace am5flow prefix
                $content = $content -replace '\bam5flow\b', 'bb6flow'
                $content = $content -replace '\bam5flow\.', 'bb6flow.'
                
                # Replace am5venn prefix
                $content = $content -replace '\bam5venn\b', 'bb6venn'
                $content = $content -replace '\bam5venn\.', 'bb6venn.'
                
                # Replace am5wc prefix (word cloud)
                $content = $content -replace '\bam5wc\b', 'bb6wc'
                $content = $content -replace '\bam5wc\.', 'bb6wc.'
                
                # Replace am5geodata prefix
                $content = $content -replace '\bam5geodata\b', 'bb6geodata'
                $content = $content -replace '\bam5geodata_', 'bb6geodata_'
                
                # Replace am5timeline prefix
                $content = $content -replace '\bam5timeline\b', 'bb6timeline'
                $content = $content -replace '\bam5timeline\.', 'bb6timeline.'
                
                # Replace am5gantt prefix
                $content = $content -replace '\bam5gantt\b', 'bb6gantt'
                $content = $content -replace '\bam5gantt\.', 'bb6gantt.'
                
                # Replace am5exporting prefix
                $content = $content -replace '\bam5exporting\b', 'bb6exporting'
                $content = $content -replace '\bam5exporting\.', 'bb6exporting.'
                
                # Replace am5plugins_ prefix
                $content = $content -replace '\bam5plugins_', 'bb6plugins_'
                
                # Replace standalone am5 (the core namespace) - must be after all compound names
                $content = $content -replace '\bam5\b', 'bb6'
                
                # ===== Replace remaining amcharts/amCharts text references =====
                $content = $content -replace 'amCharts', 'Bissbay'
                $content = $content -replace 'amcharts', 'bissbay'
                $content = $content -replace 'amChart', 'Bissbay'
                $content = $content -replace 'amchart', 'bissbay'
                
                # Fix Bissbay5 -> bissbay5 (leftover from previous rebrand)
                $content = $content -replace 'Bissbay5', 'bissbay5'
                
                # Fix any remaining URLs
                $content = $content -replace 'contact@bissbay\.com', 'support@bissbay.com'
                $content = $content -replace 'https://www\.amcharts\.com', 'https://www.bissbay.com'
                $content = $content -replace 'https://github\.com/amcharts', 'https://github.com/bissbay'
                
                # Only write if content actually changed
                if ($content -ne $originalContent) {
                    [System.IO.File]::WriteAllText($file.FullName, $content)
                    Write-Host "  [MODIFIED] $($file.FullName.Replace($dir, ''))" -ForegroundColor Yellow
                    $modifiedFiles++
                }
            }
        }
    }
}

Write-Host "`n===== REBRANDING PHASE 2 COMPLETE =====" -ForegroundColor Green
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Total files modified: $modifiedFiles" -ForegroundColor White
