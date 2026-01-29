# Luuc.ai - Asistente Legal Corporativo con IA

Plataforma de automatización legal que permite redactar y revisar documentos legales usando inteligencia artificial.

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Backend:** Next.js API Routes
- **IA:** Claude API (Anthropic)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Comenzar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local` y configura las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=tu_api_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_secret
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
luuc-ai/
├── app/
│   ├── (auth)/           # Páginas de autenticación
│   ├── (dashboard)/      # Dashboard principal
│   │   └── dashboard/
│   │       ├── redactar/ # Módulo de redacción
│   │       ├── revisar/  # Módulo de revisión
│   │       └── documentos/ # Historial
│   └── api/              # API Routes
├── components/           # Componentes React
├── lib/                  # Utilidades y configuración
└── types/               # TypeScript definitions
```

## Funcionalidades

### Redacción de Documentos
- NDA (Acuerdo de Confidencialidad)
- Contrato de Prestación de Servicios
- Carta de Terminación
- Acta de Reunión
- Política Interna

### Revisión de Documentos
- Análisis de riesgos
- Identificación de cláusulas problemáticas
- Recomendaciones de mejora
- Score de riesgo

## Deploy

El proyecto está configurado para deploy en Vercel:

```bash
npm run build
```

## Licencia

Privado - Luuc.ai © 2024
