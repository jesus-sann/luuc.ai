import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>

        <div className="space-y-6 text-slate-600">
          <p>Última actualización: Enero 2025</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              1. Información que Recopilamos
            </h2>
            <p>
              Recopilamos información que proporcionas directamente: nombre,
              correo electrónico, empresa y los documentos que procesas a
              través de la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              2. Uso de la Información
            </h2>
            <p>
              Utilizamos tu información para proporcionar y mejorar nuestros
              servicios, procesar tus documentos, y comunicarnos contigo sobre
              actualizaciones del servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              3. Seguridad de los Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger tus datos personales y documentos. Toda la información
              se transmite mediante conexiones cifradas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              4. Confidencialidad de Documentos
            </h2>
            <p>
              Los documentos procesados a través de Luuc.ai son tratados con
              estricta confidencialidad. No compartimos, vendemos ni
              utilizamos el contenido de tus documentos para fines distintos a
              la prestación del servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              5. Tus Derechos
            </h2>
            <p>
              Tienes derecho a acceder, rectificar y eliminar tus datos
              personales. Puedes solicitar la eliminación de tu cuenta y todos
              los datos asociados en cualquier momento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-800">
              6. Contacto
            </h2>
            <p>
              Para consultas sobre privacidad, contacta a{" "}
              <a
                href="mailto:privacidad@luuc.ai"
                className="text-blue-600 hover:underline"
              >
                privacidad@luuc.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
