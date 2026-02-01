import { redirect } from "next/navigation";

export default function TemplateRedirect({ params }: { params: { template: string } }) {
  redirect(`/dashboard/crear/${params.template}`);
}
