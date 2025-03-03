import { useState, useEffect, useRef } from 'react';

interface AccuracyData {
    totalItems: number;
    tolerance: number;
    directionRightnessStats: {
        'NOT CHECKED': number;
        CORRECT: number;
        INCORRECT: number;
    };
    priceRightnessStats: {
        'NOT CHECKED': number;
        CORRECT: number;
        INCORRECT: number;
    };
}

const maxRetries = 3;

export const Accuracy = () => {
    const [data, setData] = useState<AccuracyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const retryCountRef = useRef(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const url = new URL(
                '/bitcoin-predictions-accuracy',
                import.meta.env.VITE_API_URL
            );

            if (fromDate) {
                const fromDateUTC = new Date(fromDate)
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');
                url.searchParams.append('from', fromDateUTC);
            }

            if (toDate) {
                const toDateUTC = new Date(toDate)
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');
                url.searchParams.append('to', toDateUTC);
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            setData(responseData);
            setError(null);
            retryCountRef.current = 0;
            setLoading(false);
        } catch (error) {
            if (retryCountRef.current < maxRetries) {
                retryCountRef.current += 1;
                setTimeout(fetchData, 1000 * retryCountRef.current);
            } else {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch accuracy data'
                );
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const calculatePercentage = (value: number) => {
        if (!data || data.totalItems === 0) return 0;
        return ((value / data.totalItems) * 100).toFixed(1);
    };

    return (
        <div className="p-5text-green-400 bg-black max-h-[calc(100vh-40px)] overflow-auto">
            <h2 className="text-2xl font-bold mb-6 text-center uppercase">
                Bitcoin Prediction Accuracy (price tolerance: {data?.tolerance})
            </h2>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    fetchData();
                }}
                className="mb-6 flex gap-4 justify-center lg:flex-row flex-col px-4"
            >
                <div className="flex flex-col">
                    <label htmlFor="from-date" className="text-green-400">
                        From:
                    </label>
                    <input
                        id="from-date"
                        type="datetime-local"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="p-2 bg-black text-green-400 border border-green-400 rounded"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="to-date" className="text-green-400">
                        To:
                    </label>
                    <input
                        id="to-date"
                        type="datetime-local"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="p-2 bg-black text-green-400 border border-green-400 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Apply Filters
                </button>
            </form>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : data ? (
                <div className="flex gap-4 items-center lg:flex-row flex-col px-4">
                    <div className="flex flex-col gap-4 flex-1">
                        <h3 className="text-center text-lg font-bold mb-4">
                            Total Predictions: {data.totalItems}
                        </h3>
                        <div className="grid grid-cols-2 gap-8 text-white text-center">
                            {(
                                [
                                    'directionRightnessStats',
                                    'priceRightnessStats',
                                ] as const
                            ).map((category, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-lg bg-gray-900"
                                >
                                    <h4 className="text-xl font-bold mb-4">
                                        {category === 'directionRightnessStats'
                                            ? 'Direction Accuracy'
                                            : 'Price Accuracy'}
                                    </h4>
                                    {[
                                        'CORRECT',
                                        'INCORRECT',
                                        'NOT CHECKED',
                                    ].map((key) => (
                                        <div
                                            key={key}
                                            className={`p-4 rounded-lg my-2 ${
                                                key === 'CORRECT'
                                                    ? 'bg-green-500'
                                                    : key === 'INCORRECT'
                                                    ? 'bg-red-500'
                                                    : 'bg-amber-500'
                                            }`}
                                        >
                                            <h5 className="text-lg font-medium">
                                                {key}
                                            </h5>
                                            <div className="text-3xl font-bold my-2">
                                                {
                                                    data[category][
                                                        key as keyof (typeof data)[typeof category]
                                                    ]
                                                }
                                            </div>
                                            <div className="text-lg">
                                                {calculatePercentage(
                                                    data[category][
                                                        key as keyof (typeof data)[typeof category]
                                                    ]
                                                )}
                                                %
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                        <h3 className="text-center text-lg font-bold mb-4">
                            Direction Accuracy
                        </h3>
                        <div className="h-8 flex rounded overflow-hidden">
                            <div
                                className="bg-green-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.directionRightnessStats.CORRECT
                                    )}%`,
                                }}
                            />
                            <div
                                className="bg-red-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.directionRightnessStats.INCORRECT
                                    )}%`,
                                }}
                            />
                            <div
                                className="bg-amber-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.directionRightnessStats[
                                            'NOT CHECKED'
                                        ]
                                    )}%`,
                                }}
                            />
                        </div>
                        <h3 className="text-center text-lg font-bold mb-4">
                            Price Accuracy
                        </h3>
                        <div className="h-8 flex rounded overflow-hidden">
                            <div
                                className="bg-green-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.priceRightnessStats.CORRECT
                                    )}%`,
                                }}
                            />
                            <div
                                className="bg-red-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.priceRightnessStats.INCORRECT
                                    )}%`,
                                }}
                            />
                            <div
                                className="bg-amber-500"
                                style={{
                                    width: `${calculatePercentage(
                                        data.priceRightnessStats['NOT CHECKED']
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
