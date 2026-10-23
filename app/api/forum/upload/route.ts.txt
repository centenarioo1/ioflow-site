import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getUsuarioLogado } from "@/lib/auth";
import { MAX_TAMANHO_MB } from "@/lib/forumConstants";

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioLogado();
  if (!usuario) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("arquivo") as File | null;

  if (!arquivo) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!arquivo.type.startsWith("image/")) {
    return NextResponse.json({ erro: "Apenas imagens são permitidas." }, { status: 400 });
  }
  if (arquivo.size > MAX_TAMANHO_MB * 1024 * 1024) {
    return NextResponse.json({ erro: `Imagem acima de ${MAX_TAMANHO_MB}MB.` }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  const resultado = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "comunidade",
          transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
        },
        (err, result) => (err ? reject(err) : resolve(result as { secure_url: string }))
      )
      .end(buffer);
  });

  return NextResponse.json({ url: resultado.secure_url });
}