import { LoaderCircle } from "lucide-react";

interface AuthLoaderProps {
    message?: string;
}

export default function AuthLoader({
    message = "Verifying your session...",
}: AuthLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-background px-4"
        >
            <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5">
                <LoaderCircle
                    size={27}
                    strokeWidth={1.8}
                    className="animate-spin text-primary motion-reduce:animate-none"
                />
            </div>

            <p className="text-center text-sm font-medium text-brand-text-muted">
                {message}
            </p>
        </div>
    );
}