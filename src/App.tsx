import { useState } from 'react';
import { DataTable, TableConfig } from './components/DataTable';

type Reply = {
    id: string;
    createdAt: string;
    action: string;
    text: string;
    source: string;
};

type LogEntry = {
    id: string;
    createdAt: string;
    content: string;
};

const repliesConfig: TableConfig<Reply, LogEntry> = {
    columns: [
        {
            key: 'createdAt',
            header: 'Date',
            render: (value) => new Date(value).toLocaleString(),
        },
        {
            key: 'action',
            header: 'Action',
        },
        {
            key: 'text',
            header: 'Text',
        },
        {
            key: 'source',
            header: 'Source',
        },
    ],
    apiUrl: `${import.meta.env.VITE_API_URL}/memories`,
    parseResponse: (response) => ({
        ...response,
        data: response.data.map((data) => {
            const parsed = JSON.parse(data.content);
            return {
                id: data.id,
                createdAt: data.createdAt,
                ...parsed,
            };
        }),
    }),
};

const logsConfig: TableConfig<LogEntry, LogEntry> = {
    columns: [
        {
            key: 'createdAt',
            header: 'Date',
            render: (value) => new Date(value).toLocaleString(),
        },
        {
            key: 'content',
            header: 'Content',
        },
    ],
    apiUrl: `${import.meta.env.VITE_API_URL}/plugin-tarot-logs`,
    parseResponse: (response) => response,
};

const bitcoinPredictionsConfig: TableConfig<LogEntry, LogEntry> = {
    columns: [
        {
            key: 'createdAt',
            header: 'Date',
            render: (value) => new Date(value).toLocaleString(),
        },
        {
            key: 'content',
            header: 'Content',
        },
    ],
    apiUrl: `${import.meta.env.VITE_API_URL}/bitcoin-predictions`,
    parseResponse: (response) => response,
};

const tabs = ['replies', 'logs', 'bitcoin-predictions'] as const;

const App = () => {
    const [activeTab, setActiveTab] = useState<
        'replies' | 'logs' | 'bitcoin-predictions'
    >('replies');

    return (
        <div className="bg-black text-green-500 font-mono flex flex-col h-screen">
            <div className="border-b border-green-500/30">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                        px-4 py-2 mr-2 text-sm
                        hover:bg-green-500/10 cursor-pointer
                        focus:outline-none transition-colors
                        ${
                            activeTab === tab
                                ? 'text-green-400 border-b-2 border-green-500'
                                : 'text-green-500/70 border-b-2 border-transparent'
                        }
                    `}
                    >
                        {tab[0].toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>
            {activeTab === 'replies' && (
                <DataTable<Reply, LogEntry> config={repliesConfig} />
            )}
            {activeTab === 'logs' && (
                <DataTable<LogEntry, LogEntry> config={logsConfig} />
            )}
            {activeTab === 'bitcoin-predictions' && (
                <DataTable<LogEntry, LogEntry>
                    config={bitcoinPredictionsConfig}
                />
            )}
        </div>
    );
};

export default App;
