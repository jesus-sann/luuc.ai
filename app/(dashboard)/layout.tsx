import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { TopBar } from "@/components/top-bar";
import { OnboardingProvider } from "@/components/onboarding-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Mobile Header + Sidebar */}
        <MobileSidebar />

        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto bg-slate-50 dark:bg-gray-900">
            <div className="p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">{children}</div>
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
