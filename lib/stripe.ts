import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = undefined as unknown as Stripe;

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    documents: 10,
    analyses: 5,
    features: [
      "10 documentos por mes",
      "5 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
    ],
  },
  plus: {
    name: "Plus",
    price: 29,
    priceId: process.env.STRIPE_PLUS_PRICE_ID || "",
    documents: 100,
    analyses: 50,
    features: [
      "100 documentos por mes",
      "50 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
      "Base de conocimiento",
      "Soporte prioritario",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    documents: -1, // unlimited
    analyses: -1,
    features: [
      "Documentos ilimitados",
      "Análisis ilimitados",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
      "Base de conocimiento",
      "Documentos de referencia",
      "Soporte prioritario 24/7",
      "API access",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
