import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_ERROR_EVENT } from "@/services/api";

interface ApiErrorEventDetail {
    status: number;
    message: string;
    code?: string;
}

export function GlobalApiErrorListener() {
    const { toast } = useToast();

    useEffect(() => {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<ApiErrorEventDetail>;
            toast({
                variant: "destructive",
                title: `Erro ${customEvent.detail.status}`,
                description: customEvent.detail.message,
            });
        };

        window.addEventListener(API_ERROR_EVENT, handler);
        return () => window.removeEventListener(API_ERROR_EVENT, handler);
    }, [toast]);

    return null;
}
