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

const App = () => {
    const [activeTab, setActiveTab] = useState<'replies' | 'logs'>('replies');

    return (
        <div className="bg-black text-green-500 font-mono flex flex-col h-screen">
            <div className="border-b border-green-500/30">
                <button
                    onClick={() => setActiveTab('replies')}
                    className={`
                        px-4 py-2 mr-2 text-sm
                        hover:bg-green-500/10 cursor-pointer
                        focus:outline-none transition-colors
                        ${
                            activeTab === 'replies'
                                ? 'text-green-400 border-b-2 border-green-500'
                                : 'text-green-500/70 border-b-2 border-transparent'
                        }
                    `}
                >
                    Replies
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`
                        px-4 py-2 text-sm
                        hover:bg-green-500/10 cursor-pointer
                        focus:outline-none transition-colors
                        ${
                            activeTab === 'logs'
                                ? 'text-green-400 border-b-2 border-green-500'
                                : 'text-green-500/70 border-b-2 border-transparent'
                        }
                    `}
                >
                    Tarot Plugin Logs
                </button>
            </div>
            {activeTab === 'replies' ? (
                <DataTable<Reply, LogEntry> config={repliesConfig} />
            ) : (
                <DataTable<LogEntry, LogEntry> config={logsConfig} />
            )}
        </div>
    );
};

export default App;
