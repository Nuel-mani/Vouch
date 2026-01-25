export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Force light mode on all auth pages
        <div className="light">
            {children}
        </div>
    );
}
