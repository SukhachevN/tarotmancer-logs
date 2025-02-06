import { useState, useRef, useEffect } from 'react';

type ParsedContent = {
    text: string;
    source: string;
    action: string;
};

type Log = {
    id: string;
    createdAt: string;
    content: string;
};

type LogsResponse = {
    data: Log[];
    pagination: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
};

const App = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const parseContent = (content: string): ParsedContent => {
        try {
            return JSON.parse(content);
        } catch {
            return { text: content, source: '', action: '' };
        }
    };

    const fetchLogs = async (currentPage: number, limit: number = 50) => {
        try {
            setError(null);
            setLoading(true);
            const response = await fetch(
                `http://128.199.63.105:3001/memories?page=${currentPage}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = (await response.json()) as LogsResponse;
            setLogs((prevLogs) => [...prevLogs, ...data.data]);
            setHasMore(currentPage < data.pagination.totalPages);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'An error occurred while fetching data'
            );
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading]);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    return (
        <div className="h-screen bg-black text-green-500 p-4 font-mono overflow-hidden">
            <div className="max-h-screen overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-green-500/10 [&::-webkit-scrollbar-thumb]:bg-green-500/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-500/70">
                {error && (
                    <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 mb-4 rounded">
                        Error: {error}
                    </div>
                )}
                {logs.length === 0 && !loading ? (
                    <div className="text-center p-4 border border-green-500/30 rounded">
                        No logs found
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-black/90 backdrop-blur">
                            <tr className="border-b border-green-500/30">
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Text</th>
                                <th className="p-3 text-left">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-500/30">
                            {logs.map((log) => {
                                const parsed = parseContent(log.content);
                                return (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-green-500/10"
                                    >
                                        <td className="p-3">
                                            {new Date(
                                                log.createdAt
                                            ).toLocaleString()}
                                        </td>
                                        <td className="p-3 font-bold">
                                            {parsed.action}
                                        </td>
                                        <td className="p-3">{parsed.text}</td>
                                        <td className="p-3">{parsed.source}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                <div ref={observerTarget} className="h-10" />
                {loading && (
                    <div className="text-center p-4 animate-pulse">
                        Loading...
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
