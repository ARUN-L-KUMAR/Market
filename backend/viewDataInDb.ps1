# MongoDB Data Viewer PowerShell Script
# Usage: .\viewDataInDb.ps1 [collection]

param (
    [string]$collection = "products"
)

$validCollections = @("products", "categories", "reviews", "users", "orders")

if (-not $validCollections.Contains($collection.ToLower())) {
    Write-Host "Invalid collection name. Please use one of: $($validCollections -join ', ')"
    exit 1
}

Write-Host "Viewing data in $collection collection..."
Write-Host "--------------------------------------"

# Change to the backend directory
Set-Location -Path $PSScriptRoot\..

# Run the Node.js script
node utils/viewData.js $collection
