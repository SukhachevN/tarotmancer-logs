import { useState, useRef, useEffect, ReactNode } from 'react';

type Column<T> = {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T]) => ReactNode;
};

export type TableConfig<EntityType, EntryType> = {
    columns: Column<EntityType>[];
    apiUrl: string;
    parseResponse: (response: {
        data: EntryType[];
        pagination: {
            currentPage: number;
            totalPages: number;
        };
    }) => {
        data: EntityType[];
        pagination: {
            currentPage: number;
            totalPages: number;
        };
    };
};

export const DataTable = <
    EntityType extends { id: string },
    EntryType extends { id: string }
>({
    config,
}: {
    config: TableConfig<EntityType, EntryType>;
}) => {
    const [data, setData] = useState<EntityType[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isHasMore, setIsHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchData = async (currentPage: number, limit: number = 5) => {
        try {
            setError(null);
            setLoading(true);
            const response = await fetch(
                `${config.apiUrl}?page=${currentPage}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = (await response.json()) as {
                data: EntryType[];
                pagination: {
                    currentPage: number;
                    totalPages: number;
                };
            };

            const parsedData = config.parseResponse(responseData);

            setData((prevData) => [...prevData, ...parsedData.data]);
            setIsHasMore(currentPage < parsedData.pagination.totalPages);
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
                if (entries[0].isIntersecting && isHasMore && !loading) {
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
    }, [isHasMore, loading]);

    useEffect(() => {
        setData([]);
        setPage(1);
        setIsHasMore(true);
        setError(null);
        fetchData(1);
    }, [config]);

    useEffect(() => {
        if (page > 1) {
            fetchData(page);
        }
    }, [page]);

    return (
        <div className="bg-black text-green-500 font-mono overflow-hidden">
            <div className="max-h-[calc(100vh-40px)] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-green-500/10 [&::-webkit-scrollbar-thumb]:bg-green-500/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-green-500/70">
                {error && (
                    <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-4 my-4 rounded">
                        Error: {error}
                    </div>
                )}
                {data.length === 0 && !loading ? (
                    <div className="text-center p-4 border border-green-500/30 rounded">
                        No data found
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-black/90 backdrop-blur">
                            <tr className="border-b border-green-500/30">
                                {config.columns.map((column) => (
                                    <th
                                        key={column.key as string}
                                        className="p-3 text-left"
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-500/30">
                            {data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-green-500/10"
                                >
                                    {config.columns.map((column) => (
                                        <td
                                            key={column.key as string}
                                            className="p-3"
                                        >
                                            {column?.render?.(
                                                item[column.key]
                                            ) ?? (item[column.key] as string)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
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
