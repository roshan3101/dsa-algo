import { useState, useEffect } from 'react';

export function useWasm() {
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;
        let script: HTMLScriptElement | null = null;

        const loadWasm = async () => {
            try {
               
                if ((window as any).createModule) {
                    const createModule = (window as any).createModule;
                    const instance = await createModule();
                    
                    if (mounted) {
                        setModule(instance);
                        setLoading(false);
                    }
                    return;
                }

                script = document.createElement('script');
                script.src = '/sudoku_solver.js';
                script.async = true;

                script.onload = async () => {
                    try {
                        const createModule = (window as any).createModule;
                        if (!createModule) {
                            throw new Error('createModule not found after script load');
                        }

                        const instance = await createModule();
                        
                        if (mounted) {
                            setModule(instance);
                            setLoading(false);
                        }
                    } catch (err) {
                        if (mounted) {
                            setError(err as Error);
                            setLoading(false);
                        }
                    }
                };

                script.onerror = () => {
                    if (mounted) {
                        setError(new Error('Failed to load WASM script'));
                        setLoading(false);
                    }
                };

                document.head.appendChild(script);
            } catch (err) {
                if (mounted) {
                    setError(err as Error);
                    setLoading(false);
                }
            }
        };

        loadWasm();

        return () => {
            mounted = false;
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return { module, loading, error };
}