#!/usr/bin/env python3

from __future__ import annotations

import argparse
import base64
import io
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageChops


def estimate_background(image: Image.Image) -> tuple[int, int, int]:
    """Estima a cor de fundo usando os quatro cantos da imagem."""
    rgb = image.convert("RGB")
    width, height = rgb.size

    corners = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((width - 1, 0)),
        rgb.getpixel((0, height - 1)),
        rgb.getpixel((width - 1, height - 1)),
    ]

    return tuple(
        round(sum(pixel[channel] for pixel in corners) / len(corners))
        for channel in range(3)
    )


def remove_uniform_background(
    image: Image.Image,
    threshold: int,
) -> Image.Image:
    """
    Torna transparentes pixels próximos à cor estimada do fundo.

    Essa etapa só é realmente necessária quando a imagem não possui
    transparência útil.
    """
    rgba = image.convert("RGBA")
    background = estimate_background(rgba)

    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]

            distance = max(
                abs(red - background[0]),
                abs(green - background[1]),
                abs(blue - background[2]),
            )

            if distance <= threshold:
                pixels[x, y] = (red, green, blue, 0)
            elif distance <= threshold * 2:
                # Suaviza a borda em vez de produzir um recorte serrilhado.
                factor = (distance - threshold) / max(threshold, 1)
                new_alpha = round(alpha * factor)
                pixels[x, y] = (red, green, blue, new_alpha)

    return rgba


def has_useful_transparency(image: Image.Image) -> bool:
    """Verifica se o canal alfa já contém pixels transparentes."""
    if image.mode not in ("RGBA", "LA") and "transparency" not in image.info:
        return False

    alpha = image.convert("RGBA").getchannel("A")
    minimum, maximum = alpha.getextrema()

    return minimum < 250 and maximum > 0


def crop_to_content(
    image: Image.Image,
    alpha_threshold: int,
    padding_ratio: float,
) -> Image.Image:
    """Recorta margens transparentes e adiciona uma pequena folga."""
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")

    # Pixels quase transparentes não devem ampliar artificialmente o recorte.
    mask = alpha.point(
        lambda value: 255 if value > alpha_threshold else 0
    )

    bounding_box = mask.getbbox()

    if bounding_box is None:
        raise ValueError(
            "Nenhum conteúdo visível foi encontrado após remover o fundo."
        )

    left, top, right, bottom = bounding_box
    content_width = right - left
    content_height = bottom - top

    padding = round(max(content_width, content_height) * padding_ratio)

    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(rgba.width, right + padding)
    bottom = min(rgba.height, bottom + padding)

    return rgba.crop((left, top, right, bottom))


def png_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(
        buffer,
        format="PNG",
        optimize=True,
        compress_level=9,
    )
    return buffer.getvalue()


def create_svg(image: Image.Image, output_path: Path) -> None:
    """
    Cria um SVG válido contendo a imagem PNG recortada.

    O viewBox corresponde exatamente ao conteúdo, fazendo o logo ocupar
    praticamente toda a área do SVG.
    """
    encoded = base64.b64encode(png_bytes(image)).decode("ascii")
    width, height = image.size

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="{width}"
    height="{height}"
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Logo FertIntelligence">
  <image
      x="0"
      y="0"
      width="{width}"
      height="{height}"
      preserveAspectRatio="xMidYMid meet"
      href="data:image/png;base64,{encoded}"
      xlink:href="data:image/png;base64,{encoded}" />
</svg>
"""

    output_path.write_text(svg, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Corrige uma imagem PNG salva incorretamente com extensão SVG, "
            "remove margens e gera um SVG válido."
        )
    )

    parser.add_argument(
        "--input",
        default="fertintelligence-logo.svg",
        help="Arquivo de entrada. Padrão: fertintelligence-logo.svg",
    )
    parser.add_argument(
        "--output",
        default="fertintelligence-logo-fixed.svg",
        help="SVG de saída. Padrão: fertintelligence-logo-fixed.svg",
    )
    parser.add_argument(
        "--png-output",
        default="fertintelligence-logo-fixed.png",
        help="PNG recortado de saída.",
    )
    parser.add_argument(
        "--background-threshold",
        type=int,
        default=22,
        help=(
            "Tolerância para remover fundo uniforme quando não há alfa. "
            "Padrão: 22"
        ),
    )
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=8,
        help="Alfa mínimo considerado visível no recorte. Padrão: 8",
    )
    parser.add_argument(
        "--padding",
        type=float,
        default=0.02,
        help=(
            "Margem proporcional ao redor do desenho. "
            "0.02 corresponde a 2%%. Use 0 para nenhum espaço."
        ),
    )
    parser.add_argument(
        "--force-remove-background",
        action="store_true",
        help="Remove o fundo mesmo quando a imagem já possui transparência.",
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    png_output_path = Path(args.png_output)

    if not input_path.exists():
        print(f"Erro: arquivo não encontrado: {input_path}", file=sys.stderr)
        return 1

    if not 0 <= args.padding <= 0.5:
        print(
            "Erro: --padding deve estar entre 0 e 0.5.",
            file=sys.stderr,
        )
        return 1

    backup_path = input_path.with_suffix(input_path.suffix + ".bak")

    if not backup_path.exists():
        shutil.copy2(input_path, backup_path)
        print(f"Backup criado: {backup_path}")

    try:
        with Image.open(input_path) as source:
            source.load()
            image = source.convert("RGBA")
            detected_format = source.format or "desconhecido"
    except Exception as error:
        print(f"Erro ao abrir a imagem: {error}", file=sys.stderr)
        return 1

    print(f"Formato real detectado: {detected_format}")
    print(f"Dimensões originais: {image.width} x {image.height}")

    if args.force_remove_background or not has_useful_transparency(image):
        print(
            "Removendo fundo uniforme estimado a partir dos cantos "
            f"(tolerância {args.background_threshold})..."
        )
        image = remove_uniform_background(
            image,
            threshold=args.background_threshold,
        )
    else:
        print("A imagem já possui transparência; ela será preservada.")

    try:
        cropped = crop_to_content(
            image,
            alpha_threshold=args.alpha_threshold,
            padding_ratio=args.padding,
        )
    except ValueError as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1

    cropped.save(
        png_output_path,
        format="PNG",
        optimize=True,
        compress_level=9,
    )

    create_svg(cropped, output_path)

    print(f"Dimensões recortadas: {cropped.width} x {cropped.height}")
    print(f"PNG corrigido: {png_output_path}")
    print(f"SVG válido: {output_path}")
    print(
        "\nO viewBox do SVG corresponde à área recortada; "
        "o logo agora ocupa praticamente toda a malha."
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())