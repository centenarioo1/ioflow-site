<#
.SYNOPSIS
    Script para remover com seguranca apenas as copias '.txt' que foram geradas para envio no chat,
    preservando os arquivos '.txt' que ja existiam originalmente no projeto.
.DESCRIPTION
    Este script varre o diretorio recursivamente buscando arquivos que terminam com '.txt'.
    Para cada arquivo '.txt' encontrado, ele verifica se existe um arquivo correspondente
    sem a extensao '.txt' na mesma pasta (ex: se encontrar 'App.tsx.txt', verifica se 'App.tsx' existe).
    Se o arquivo original existir, ele deleta a copia '.txt'. Caso contrario, mantem o arquivo intacto.
#>

$sourceDir = Get-Location

Write-Host "=== REMOVEDOR DE COPIAS .TXT GERADAS ===" -ForegroundColor Cyan
Write-Host "Diretorio atual: $sourceDir"
Write-Host "Analisando arquivos..." -ForegroundColor Gray

# Pastas a serem ignoradas na busca por seguranca
$excludeFolders = @(
    'node_modules', 
    '.next', 
    '.git'
)

if (-not (Test-Path $sourceDir)) {
    Write-Error "Diretorio nao encontrado!"
    exit
}

# Busca apenas os arquivos .txt do projeto
$txtFiles = Get-ChildItem -Path $sourceDir -Recurse -File -Filter "*.txt" | Where-Object {
    $relative = $_.FullName.Substring($sourceDir.Path.Length)
    
    $shouldExclude = $false
    foreach ($folder in $excludeFolders) {
        if ($relative -like "*\$folder\*" -or $relative -like "$folder\*") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

$removedCount = 0
$preservedCount = 0

foreach ($file in $txtFiles) {
    # Remove a extensao ".txt" do final do caminho para descobrir o nome original do arquivo
    # Exemplo: "C:\projeto\src\App.tsx.txt" vira "C:\projeto\src\App.tsx"
    $originalPath = $file.FullName.Substring(0, $file.FullName.Length - 4)
    
    # Se o arquivo original correspondente existir, significa que este .txt e uma copia gerada pelo script
    if (Test-Path $originalPath -PathType Leaf) {
        Remove-Item -Path $file.FullName -Force
        $removedCount++
    } else {
        # Se nao existe um arquivo original correspondente, era um arquivo .txt legitimo que ja existia antes
        $preservedCount++
    }
}

Write-Host ""
Write-Host "Limpeza concluida com sucesso!" -ForegroundColor Green
Write-Host "Arquivos duplicados deletados: $removedCount" -ForegroundColor Green
Write-Host "Arquivos .txt originais preservados: $preservedCount" -ForegroundColor Yellow
