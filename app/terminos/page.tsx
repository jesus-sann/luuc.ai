import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Términos de Servicio
        </h1>

        <div className="space-y-6 text-slate-600">
          <p>Última actualización: Enero 2025</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar Luuc.ai, aceptas estar sujeto a estos
              Términos de Servicio. Si no estás de acuerdo con alguna parte de
              estos términos, no podrás acceder al servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              2. Descripción del Servicio
            </h2>
            <p>
              Luuc.ai es una plataforma de asistencia legal impulsada por
              inteligencia artificial que permite la redacción, revisión y
              gestión de documentos legales. El servicio no constituye asesoría
              legal profesional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              3. Uso del Servicio
            </h2>
            <p>
              Te comprometes a utilizar el servicio de manera responsable y de
              acuerdo con todas las leyes aplicables. No deberás usar el
              servicio para actividades ilegales o no autorizadas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              4. Propiedad Intelectual
            </h2>
            <p>
              Los documentos generados a través de Luuc.ai son propiedad del
              usuario. La plataforma, su diseño, código y marca son propiedad
              de Luuc.ai.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              5. Limitación de Responsabilidad
            </h2>
            <p>
              Luuc.ai es una herramienta de asistencia y no reemplaza el
              consejo de un abogado profesional. No nos hacemos responsables
              por decisiones legales basadas únicamente en los resultados de la
              plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              6. Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos, puedes
              contactarnos en{" "}
              <a
                href="mailto:legal@luuc.ai"
                className="text-blue-600 hover:underline"
              >
                legal@luuc.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
