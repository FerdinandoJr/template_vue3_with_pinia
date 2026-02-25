$outputFile = "projeto_completo.md"

# Pastas que NÃO devem ser exportadas
$foldersToExclude = @("node_modules", ".git", ".vscode", "dist")

# Extensões que devem ser incluídas
$extensionsToInclude = @(".ts", ".vue", ".js", ".json", ".css", ".html")

Clear-Host
Write-Host "Iniciando exportacao do projeto..." -ForegroundColor Yellow

# Usaremos um ArrayList para performance e evitar IO constante no disco
$contentBuffer = New-Object System.Collections.Generic.List[string]

# Cabeçalho do markdown
$contentBuffer.Add("# Projeto Exportado")
$contentBuffer.Add("Gerado em: $(Get-Date)")
$contentBuffer.Add("`n---`n")

$count = 0

# Coleta os arquivos primeiro para evitar conflitos de leitura/escrita simultânea
$files = Get-ChildItem -Recurse -File | Where-Object {
    $file = $_
    $ext = $file.Extension.ToLower()
    
    # Verifica extensão
    if ($extensionsToInclude -notcontains $ext) { return $false }

    # Verifica se está dentro de pasta excluída
    foreach ($folder in $foldersToExclude) {
        if ($file.FullName -like "*\$folder\*") { return $false }
    }

    # Evita que o script tente ler o próprio arquivo de saída se ele já existir
    if ($file.Name -eq $outputFile) { return $false }

    return $true
}

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart("\")
    Write-Host "Processando: $relativePath"

    $contentBuffer.Add("## 📄 $relativePath")
    $contentBuffer.Add('```' + $file.Extension.TrimStart('.')) # Adiciona a linguagem para syntax highlighting
    
    try {
        $fileContent = Get-Content $file.FullName -Raw -ErrorAction Stop
        $contentBuffer.Add($fileContent)
    } catch {
        $contentBuffer.Add("ERRO: Não foi possível ler este arquivo.")
    }

    $contentBuffer.Add('```')
    $contentBuffer.Add("`n---`n")
    $count++
}

# Grava tudo de uma vez só no arquivo (Muito mais rápido e seguro)
try {
    $contentBuffer | Out-File -FilePath $outputFile -Encoding utf8 -Force
    Write-Host ""
    Write-Host "SUCESSO! $count arquivos exportados para: $outputFile" -ForegroundColor Green
} catch {
    Write-Host "Erro ao salvar o arquivo final: $_" -ForegroundColor Red
}