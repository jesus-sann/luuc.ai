export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { generateDocx, generatePdf } from "@/lib/document-export";
import { getCompanyByUser } from "@/lib/company";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

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

    // Verify ownership — explicit null check prevents null !== null bypass (C-2)
    const userOwnsDocument = document.user_id === user.id;
    const sameCompany =
      user.company_id != null &&
      document.company_id != null &&
      document.company_id === user.company_id;
    if (!userOwnsDocument && !sameCompany) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para exportar este documento" },
        { status: 403 }
      );
    }

    auditLog({
      userId: user.id,
      companyId: user.company_id ?? undefined,
      action: "document.export",
      resourceType: "document",
      resourceId: params.id,
      metadata: { format, title: document.title },
      ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    const title = document.title || "Documento";
    const content = document.content || "";

    // Fetch company for letterhead
    const company = await getCompanyByUser(user.id).catch(() => null);
    const firmInfo = company as import("@/lib/document-export").FirmInfo | null;

    let buffer: Buffer;
    let contentType: string;
    let extension: string;

    if (format === "docx") {
      buffer = await generateDocx(title, content, firmInfo);
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      extension = "docx";
    } else {
      buffer = await generatePdf(title, content, firmInfo);
      contentType = "application/pdf";
      extension = "pdf";
    }

    // Sanitize filename + RFC 5987 encoding for non-ASCII chars (L-3)
    const safeName = title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]/g, "").trim() || "documento";
    const encodedName = encodeURIComponent(`${safeName}.${extension}`);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}.${extension}"; filename*=UTF-8''${encodedName}`,
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
