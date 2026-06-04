export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByUser, getCompanyById } from "@/lib/company";
import { supabaseAdmin } from "@/lib/supabase";
import { withRateLimit } from "@/lib/api-middleware";

const BUCKET = "company-assets";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];

async function postHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    let company = await getCompanyByUser(user.id);
    if (!company && user.company_id) {
      company = await getCompanyById(user.company_id);
    }
    if (!company) {
      return NextResponse.json({ success: false, error: "No tienes una empresa registrada" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const assetType = formData.get("type") as string | null; // "logo" | "letterhead"

    if (!file) {
      return NextResponse.json({ success: false, error: "No se encontró archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Solo se permiten imágenes (PNG, JPG, WebP, SVG, GIF)" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "El archivo excede el límite de 5 MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeType = assetType === "letterhead" ? "letterhead" : "logo";
    const path = `${company.id}/${safeType}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ success: false, error: "Error al subir archivo" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    // Cache-bust so the new image shows immediately
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Error en POST /api/company/upload-asset:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export const POST = withRateLimit(postHandler, "crud");
