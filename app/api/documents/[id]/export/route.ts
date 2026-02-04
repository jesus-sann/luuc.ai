export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { generateDocx, generatePdf } from "@/lib/document-export";
import { withRateLimit } from "@/lib/api-middleware";

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const format = request.nextUrl.searchParams.get("format");
    if (!format || !["docx", "pdf"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Formato inválido. Usa ?format=docx o ?format=pdf" },
        { status: 400 }
      );
    }

    const document = await getDocumentById(params.id);
    if (!document) {
      return NextResponse.json(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.user_id !== user.id && document.company_id !== user.company_id) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para exportar este documento" },
        { status: 403 }
      );
    }

    const title = document.title || "Documento";
    const content = document.content || "";

    let buffer: Buffer;
    let contentType: string;
    let extension: string;

    if (format === "docx") {
      buffer = await generateDocx(title, content);
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      extension = "docx";
    } else {
      buffer = generatePdf(title, content);
      contentType = "application/pdf";
      extension = "pdf";
    }

    // Sanitize filename
    const safeName = title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]/g, "").trim() || "documento";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}.${extension}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting document:", error);
    return NextResponse.json(
      { success: false, error: "Error al exportar documento" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(handler, "read");
