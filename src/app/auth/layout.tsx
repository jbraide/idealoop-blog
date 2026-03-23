import { SessionProvider } from "@/components/providers/session-provider";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return <SessionProvider>{children}</SessionProvider>;
}
