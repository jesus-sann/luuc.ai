export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { createCompany, getCompanyByUser, getCompanyById, updateCompany } from "@/lib/company";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/company/setup
 * Obtener la empresa del usuario actual
 */
async function getHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Buscar empresa donde el usuario es owner
    let company = await getCompanyByUser(user.id);

    // Si no es owner, buscar por company_id del usuario
    if (!company && user.company_id) {
      company = await getCompanyById(user.company_id);
    }

    if (!company) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Error en GET /api/company/setup:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/setup
 * Crear una nueva empresa
 */
async function postHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar si el usuario ya tiene empresa
    const existingCompany = await getCompanyByUser(user.id);
    if (existingCompany) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Ya tienes una empresa registrada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, industry, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== "string" || industry.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Industria es requerida" },
        { status: 400 }
      );
    }

    // SECURITY: Enforce length limits matching the DB column definitions
    if (name.trim().length > 255) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Nombre demasiado largo (máximo 255 caracteres)" },
        { status: 400 }
      );
    }

    if (industry.trim().length > 100) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Industria demasiado larga (máximo 100 caracteres)" },
        { status: 400 }
      );
    }

    if (description && (typeof description !== "string" || description.length > 2000)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Descripción demasiado larga (máximo 2000 caracteres)" },
        { status: 400 }
      );
    }

    const company = await createCompany(user.id, name.trim(), industry.trim(), description?.trim());

    if (!company) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al crear la empresa" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: company },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/company/setup:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company/setup
 * Actualizar empresa existente
 */
async function putHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario tenga empresa
    const company = await getCompanyByUser(user.id);
    if (!company) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa registrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name, industry, description, document_rules,
      address_line1, address_line2, city, state, zip,
      phone, website, logo_url, primary_color, tagline,
      bar_number, practice_areas, letterhead_url,
    } = body;

    const updatedCompany = await updateCompany(company.id, user.id, {
      name: name || company.name,
      industry: industry || company.industry,
      description: description !== undefined ? description : company.description,
      document_rules: document_rules || company.document_rules,
      ...(address_line1 !== undefined && { address_line1 }),
      ...(address_line2 !== undefined && { address_line2 }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zip !== undefined && { zip }),
      ...(phone !== undefined && { phone }),
      ...(website !== undefined && { website }),
      ...(logo_url !== undefined && { logo_url }),
      ...(primary_color !== undefined && { primary_color }),
      ...(tagline !== undefined && { tagline }),
      ...(bar_number !== undefined && { bar_number }),
      ...(practice_areas !== undefined && { practice_areas }),
      ...(letterhead_url !== undefined && { letterhead_url }),
    });

    if (!updatedCompany) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al actualizar la empresa" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error en PUT /api/company/setup:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const POST = withRateLimit(postHandler, "crud");
export const PUT = withRateLimit(putHandler, "crud");
