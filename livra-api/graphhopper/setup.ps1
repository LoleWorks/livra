# GraphHopper self-hosted setup for Livra
# Run this script once from the graphhopper\ directory:
#   cd livra-api\graphhopper
#   .\setup.ps1

$ErrorActionPreference = "Stop"
$GH_VERSION = "9.1"
$JAR = "graphhopper-web-$GH_VERSION.jar"
$OSM = "moldova-latest.osm.pbf"

Write-Host ""
Write-Host "=== Livra GraphHopper Setup ===" -ForegroundColor Cyan
Write-Host ""

# ── 1. Java check ─────────────────────────────────────────────────────────────
try {
    $javaVersion = & java -version 2>&1 | Select-String "version"
    Write-Host "[OK] Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Java not found. Install JDK 11+ and add it to PATH." -ForegroundColor Red
    Write-Host "        Android Studio's JBR works: set JAVA_HOME to Android Studio\jbr" -ForegroundColor Yellow
    exit 1
}

# ── 2. Download GraphHopper JAR ───────────────────────────────────────────────
if (Test-Path $JAR) {
    Write-Host "[SKIP] $JAR already exists." -ForegroundColor Yellow
} else {
    Write-Host "[....] Downloading GraphHopper $GH_VERSION (~70 MB)..." -ForegroundColor Cyan
    $url = "https://github.com/graphhopper/graphhopper/releases/download/$GH_VERSION/$JAR"
    Invoke-WebRequest -Uri $url -OutFile $JAR -UseBasicParsing
    Write-Host "[OK]   Downloaded $JAR" -ForegroundColor Green
}

# ── 3. Download Moldova OSM extract ───────────────────────────────────────────
if (Test-Path $OSM) {
    Write-Host "[SKIP] $OSM already exists." -ForegroundColor Yellow
} else {
    Write-Host "[....] Downloading Moldova OSM extract from Geofabrik (~15 MB)..." -ForegroundColor Cyan
    $url = "https://download.geofabrik.de/europe/moldova-latest.osm.pbf"
    Invoke-WebRequest -Uri $url -OutFile $OSM -UseBasicParsing
    Write-Host "[OK]   Downloaded $OSM" -ForegroundColor Green
}

# ── 4. Done ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To build the graph and start GraphHopper, run:" -ForegroundColor White
Write-Host "  cd livra-api\graphhopper" -ForegroundColor Yellow
Write-Host "  java -Xmx512m -jar $JAR server config.yml" -ForegroundColor Yellow
Write-Host ""
Write-Host "First run builds the graph cache (~2 min). Subsequent starts take ~10 sec." -ForegroundColor Gray
Write-Host "GraphHopper will be available at http://localhost:8989" -ForegroundColor Gray
Write-Host ""
