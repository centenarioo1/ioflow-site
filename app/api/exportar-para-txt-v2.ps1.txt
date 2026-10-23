<#
.SYNOPSIS
    Script para duplicar arquivos de um projeto Node.js/Next.js criando cópias com a extensão '.txt'
    no mesmo diretório, sem alterar ou substituir os arquivos originais.
.DESCRIPTION
    Este script varre a pasta atual recursivamente, ignora diretórios pesados (node_modules, .next, etc.)
    e cria uma cópia de cada arquivo de código adicionando '.txt' ao final do nome do arquivo (ex: 'App.tsx' vira 'App.tsx.txt').
    Os arquivos originais (.ts, .tsx, .json, .prisma, etc.) continuam intactos e intocados no mesmo lugar!
#>

$sourceDir = Get-Location

Write-Host "=== DUPLICADOR DE ARQUIVOS PARA .TXT (MANTÉM ORIGINAIS) ===" -ForegroundColor Cyan
Write-Host "Pasta atual: $sourceDir"
Write-Host "Os arquivos originais NÃO serão substituídos nem apagados." -ForegroundColor Yellow
Write-Host ""

# Pastas a serem ignoradas
$excludeFolders = @(
    'node_modules', 
    '.next', 
    '.git', 
    '.github',
    '.vscode', 
    'dist', 
    'build', 
    'out',
    'coverage',
    '.expo',
    '.vercel'
)

# Arquivos de mídia ou binários que não faz sentido duplicar para ler no chat
$excludeExtensions = @(
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.pdf', '.zip', '.rar', 
    '.mp4', '.mp3', '.ttf', '.woff', '.woff2', '.eot', '.db', '.sqlite', '.exe'
)

Write-Host "Buscando arquivos..." -ForegroundColor Gray
$files = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $relative = $_.FullName.Substring($sourceDir.Path.Length)
    
    # 1. Filtra as pastas excluídas
    $shouldExclude = $false
    foreach ($folder in $excludeFolders) {
        if ($relative -like "*\\$folder\\*" -or $relative -like "$folder\\*") {
            $shouldExclude = $true
            break
        }
    }
    
    # 2. Ignora se já for um arquivo .txt ou arquivo de mídia
    if ($_.Extension.ToLower() -eq '.txt' -or $excludeExtensions -contains $_.Extension.ToLower()) {
        $shouldExclude = $true
    }
    
    -not $shouldExclude
}

Write-Host "Criando cópias .txt para $($files.Count) arquivos..." -ForegroundColor Cyan

$copiedCount = 0
foreach ($file in $files) {
    # Define o nome da cópia adicionando .txt ao final do nome do arquivo original
    # Exemplo: pasta/App.tsx vira pasta/App.tsx.txt
    $destinationFile = "$($file.FullName).txt"
    
    # Copia o arquivo sem deletar ou substituir o arquivo original
    Copy-Item -Path $file.FullName -Destination $destinationFile -Force
    $copiedCount++
}

Write-Host ""
Write-Host "Concluído com sucesso!" -ForegroundColor Green
Write-Host "Total de arquivos duplicados para .txt: $copiedCount" -ForegroundColor Green
Write-Host "Agora você pode enviar os novos arquivos .txt criados no mesmo diretório!" -ForegroundColor Gray
