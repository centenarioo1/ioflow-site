import os
import shutil
import re
from pathlib import Path

# Diretórios a serem ignorados (para não processar código compilado ou dependências)
IGNORED_DIRS = {
    'node_modules', '.next', '.git', '.vscode', '.idea',
    'build', 'dist', 'out', '.vercel', 'coverage', 'fontes_txt', 'fontes_bioflow_txt'
}

# Extensões de arquivos relevantes para mapeamento do código do projeto
ALLOWED_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx', '.json', '.prisma',
    '.css', '.scss', '.sql', '.md', '.html', '.env.example'
}

def sanitize_name(path_str: str) -> str:
    """Transforma o caminho relativo em um nome de arquivo limpo e amigável."""
    # Substitui separadores de diretório e caracteres especiais por underline
    clean_str = re.sub(r'[\\/]+', '_', path_str)
    clean_str = re.sub(r'[^a-zA-Z0-9_\.]', '_', clean_str)
    return clean_str

def main():
    root_dir = Path.cwd()
    output_dir = root_dir / "fontes_bioflow_txt"
    
    # Limpa ou cria a pasta de saída
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"📁 Mapeando projeto em: {root_dir}")
    print(f"📦 Pasta de saída: {output_dir}\n")

    count = 0
    for current_root, dirs, files in os.walk(root_dir):
        # Filtra pastas ignoradas
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith('.')]

        for file in files:
            file_path = Path(current_root) / file
            rel_path = file_path.relative_to(root_dir)
            
            # Verifica a extensão do arquivo
            if file_path.suffix.lower() in ALLOWED_EXTENSIONS or file == '.env.example':
                # Cria nome no formato: caminho_pasta_nomearquivo.ext.txt
                # Exemplo: app/admin/page.tsx -> app_admin_page.tsx.txt
                new_filename = sanitize_name(str(rel_path)) + ".txt"
                target_file = output_dir / new_filename

                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f_in:
                        content = f_in.read()

                    with open(target_file, 'w', encoding='utf-8') as f_out:
                        # Cabeçalho identificador no topo do arquivo para a IA
                        f_out.write(f"// ==========================================\n")
                        f_out.write(f"// ARQUIVO FONTE ORIGINAL: {rel_path}\n")
                        f_out.write(f"// ==========================================\n\n")
                        f_out.write(content)

                    count += 1
                    print(f"  ✓ Processado: {rel_path} -> {new_filename}")
                except Exception as e:
                    print(f"  ⚠️ Erro ao processar {rel_path}: {e}")

    print(f"\n✅ Concluído! Total de {count} arquivos convertidos com sucesso para a pasta '{output_dir.name}'.")

if __name__ == "__main__":
    main()
