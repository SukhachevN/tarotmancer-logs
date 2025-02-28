import { useState, useEffect, useRef } from 'react';

interface AccuracyData {
    totalItems: number;
    rightnessStats: {
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
        } catch (err) {
            console.error(err);

            if (retryCountRef.current < maxRetries) {
                retryCountRef.current += 1;

                setError(
                    `Error loading data. Retry attempt ${retryCountRef.current}/${maxRetries}...`
                );

                setTimeout(() => {
                    fetchData();
                }, 1000 * retryCountRef.current);
            } else {
                setError('Failed to fetch accuracy data');
                setLoading(false);
            }
        } finally {
            if (retryCountRef.current >= maxRetries) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="p-5 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Bitcoin Prediction Accuracy
            </h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="from-date" className="mb-1 text-sm">
                            From:
                        </label>
                        <input
                            id="from-date"
                            type="datetime-local"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="to-date" className="mb-1 text-sm">
                            To:
                        </label>
                        <input
                            id="to-date"
                            type="datetime-local"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="text-center my-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 my-10">{error}</div>
            ) : data ? (
                <div className="mt-6">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold">
                            Total Predictions: {data.totalItems}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        <div className="bg-green-500 text-white p-5 rounded-lg shadow-md">
                            <h4 className="text-lg font-medium">Correct</h4>
                            <div className="text-3xl font-bold my-2">
                                {data.rightnessStats.CORRECT}
                            </div>
                            <div className="text-lg">
                                {calculatePercentage(
                                    data.rightnessStats.CORRECT
                                )}
                                %
                            </div>
                        </div>

                        <div className="bg-red-500 text-white p-5 rounded-lg shadow-md">
                            <h4 className="text-lg font-medium">Incorrect</h4>
                            <div className="text-3xl font-bold my-2">
                                {data.rightnessStats.INCORRECT}
                            </div>
                            <div className="text-lg">
                                {calculatePercentage(
                                    data.rightnessStats.INCORRECT
                                )}
                                %
                            </div>
                        </div>

                        <div className="bg-amber-500 text-white p-5 rounded-lg shadow-md">
                            <h4 className="text-lg font-medium">Not Checked</h4>
                            <div className="text-3xl font-bold my-2">
                                {data.rightnessStats['NOT CHECKED']}
                            </div>
                            <div className="text-lg">
                                {calculatePercentage(
                                    data.rightnessStats['NOT CHECKED']
                                )}
                                %
                            </div>
                        </div>
                    </div>

                    <div className="h-8 flex rounded overflow-hidden">
                        <div
                            className="bg-green-500 transition-all duration-500 ease-in-out"
                            style={{
                                width: `${calculatePercentage(
                                    data.rightnessStats.CORRECT
                                )}%`,
                            }}
                            title={`Correct: ${calculatePercentage(
                                data.rightnessStats.CORRECT
                            )}%`}
                        />
                        <div
                            className="bg-red-500 transition-all duration-500 ease-in-out"
                            style={{
                                width: `${calculatePercentage(
                                    data.rightnessStats.INCORRECT
                                )}%`,
                            }}
                            title={`Incorrect: ${calculatePercentage(
                                data.rightnessStats.INCORRECT
                            )}%`}
                        />
                        <div
                            className="bg-amber-500 transition-all duration-500 ease-in-out"
                            style={{
                                width: `${calculatePercentage(
                                    data.rightnessStats['NOT CHECKED']
                                )}%`,
                            }}
                            title={`Not Checked: ${calculatePercentage(
                                data.rightnessStats['NOT CHECKED']
                            )}%`}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};
