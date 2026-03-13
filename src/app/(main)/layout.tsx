import Header from "@/components/layout/header";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 p-6 container mx-auto">{children}</main>
        </div>
    );
}
