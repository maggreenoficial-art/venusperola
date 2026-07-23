"""Copia fotos originais da pasta foto-produto-1 para public/products (sem alteração)."""
from pathlib import Path
import shutil

SRC_DIR = Path(__file__).resolve().parent.parent / "public/products/foto-produto-1"
OUT_DIR = Path(__file__).resolve().parent.parent / "public/products"

FILES = [
    ("1229-4.jpg", "5414-1.jpg"),
    ("1228-4.jpg", "5414-2.jpg"),
    ("1230-4.jpg", "5414-3.jpg"),
    ("1231-4.jpg", "5414-4.jpg"),
    ("1232-4.jpg", "5414-5.jpg"),
]

if __name__ == "__main__":
    if not SRC_DIR.exists():
        print(f"Pasta não encontrada: {SRC_DIR}")
        exit(1)
    for src, out in FILES:
        shutil.copy2(SRC_DIR / src, OUT_DIR / out)
        print(f"OK {src} -> {out}")
    print("Done.")
