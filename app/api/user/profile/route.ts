import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/types";

/**
 * PUT /api/user/profile
 * Actualizar perfil del usuario
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, phone, position } = body;

    // Actualizar user metadata en Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: full_name || null,
        phone: phone || null,
        position: position || null,
      },
    });

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al actualizar perfil" },
        { status: 500 }
      );
    }

    // También actualizar el nombre en la tabla users si existe
    try {
      await supabase
        .from("users")
        .update({
          name: full_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch {
      // Ignorar si falla
    }

    return NextResponse.json({
      success: true,
      data: { full_name, phone, position },
    });
  } catch (error) {
    console.error("Error en PUT /api/user/profile:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Obtener perfil del usuario
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        phone: user.user_metadata?.phone || null,
        position: user.user_metadata?.position || null,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/user/profile:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
