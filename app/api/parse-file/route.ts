export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se proporcionó un archivo" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "El archivo excede el tamaño máximo de 10MB" },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    let text = "";

    if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      text = await file.text();
    } else if (filename.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Formato no soportado. Usa PDF, DOCX o TXT." },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se pudo extraer texto suficiente del archivo." },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ text: string; filename: string }>>({
      success: true,
      data: { text: text.trim(), filename: file.name },
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error procesando el archivo" },
      { status: 500 }
    );
  }
}
