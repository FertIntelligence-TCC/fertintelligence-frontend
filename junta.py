#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import argparse


DEFAULT_EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".vite",
    "coverage",
    "out",
}


def is_inside_excluded_dir(path: Path, project_root: Path, excluded_dirs: set[str]) -> bool:
    try:
        rel_parts = path.relative_to(project_root).parts
    except ValueError:
        return True
    return any(part in excluded_dirs for part in rel_parts)


def collect_files(project_root: Path, excluded_dirs: set[str]) -> list[Path]:
    files: list[Path] = []
    for ext in ("*.ts", "*.tsx"):
        for f in project_root.rglob(ext):
            if f.is_file() and not is_inside_excluded_dir(f, project_root, excluded_dirs):
                files.append(f)
    # ordem estável e previsível
    files.sort(key=lambda p: str(p.relative_to(project_root)).lower())
    return files


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Exporta todos os arquivos .ts e .tsx do projeto para um txt único."
    )
    parser.add_argument(
        "-o",
        "--output",
        default="ts_tsx_dump.txt",
        help="Nome do arquivo de saída (default: ts_tsx_dump.txt)",
    )
    parser.add_argument(
        "--include-node-modules",
        action="store_true",
        help="Se setado, NÃO exclui node_modules (não recomendado).",
    )
    args = parser.parse_args()

    project_root = Path.cwd().resolve()

    excluded_dirs = set(DEFAULT_EXCLUDE_DIRS)
    if args.include_node_modules:
        excluded_dirs.discard("node_modules")

    out_path = project_root / args.output

    files = collect_files(project_root, excluded_dirs)

    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        for idx, file_path in enumerate(files):
            rel = file_path.relative_to(project_root).as_posix()

            # Cabeçalho com caminho relativo
            out.write(f"[{rel}]\n")

            try:
                content = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                # fallback simples caso tenha arquivo com encoding estranho
                content = file_path.read_text(encoding="utf-8", errors="replace")

            out.write(content.rstrip() + "\n")

            # Separador entre arquivos (não coloca --- extra no final)
            if idx != len(files) - 1:
                out.write("\n---\n\n")

    print(f"✅ Exportados {len(files)} arquivos para: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())