import { useState } from 'react';

import { DataTable, TableConfig } from './components/DataTable';
import { Accuracy } from './components/Accuracy';

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

type BitcoinPrediction = {
    id: string;
    createdAt: string;
    bitcoinCurrentPrice: number;
    bitcoinPredictedPrice: number;
    direction: 'UP' | 'DOWN';
    directionRightness: 'CORRECT' | 'INCORRECT' | 'NOT CHECKED';
    priceRightness: 'CORRECT' | 'INCORRECT' | 'NOT CHECKED';
};

type TwitterInteractionLog = {
    id: string;
    createdAt: string;
    username: string;
    tweet: string;
    action: string;
    response: string;
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

const bitcoinPredictionsConfig: TableConfig<
    BitcoinPrediction,
    BitcoinPrediction
> = {
    columns: [
        {
            key: 'createdAt',
            header: 'Date',
            render: (value) => new Date(value).toLocaleString(),
        },
        {
            key: 'bitcoinCurrentPrice',
            header: 'Current Price',
            render: (value) => (value ? `$${value.toLocaleString()}` : 'N/A'),
        },
        {
            key: 'bitcoinPredictedPrice',
            header: 'Predicted Price',
            render: (value) => (value ? `$${value.toLocaleString()}` : 'N/A'),
        },
        {
            key: 'direction',
            header: 'Direction',
        },
        {
            key: 'directionRightness',
            header: 'Direction Rightness',
        },
        {
            key: 'priceRightness',
            header: 'Price Rightness',
        },
    ],
    apiUrl: `${import.meta.env.VITE_API_URL}/bitcoin-predictions-with-allora`,
    parseResponse: (response) => response,
};

const twitterInteractionLogsConfig: TableConfig<
    TwitterInteractionLog,
    TwitterInteractionLog
> = {
    columns: [
        {
            key: 'createdAt',
            header: 'Date',
        },
        {
            key: 'username',
            header: 'Username',
        },
        {
            key: 'tweet',
            header: 'Tweet',
        },
        {
            key: 'action',
            header: 'Action',
        },
        {
            key: 'response',
            header: 'Response',
        },
    ],
    apiUrl: `${import.meta.env.VITE_API_URL}/twitter-interactions-logs`,
    parseResponse: (response) => response,
};

const tabs = [
    'replies',
    'logs',
    'bitcoin-predictions',
    'accuracy',
    'twitter-interactions',
] as const;

const App = () => {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(() => {
        const savedTab = localStorage.getItem(
            'activeTab'
        ) as (typeof tabs)[number];

        return tabs.includes(savedTab) ? savedTab : 'replies';
    });

    const handleTabChange = (tab: (typeof tabs)[number]) => {
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
    };

    return (
        <div className="bg-black text-green-500 font-mono flex flex-col h-screen">
            <div className="border-b border-green-500/30">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
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
                <DataTable<BitcoinPrediction, BitcoinPrediction>
                    config={bitcoinPredictionsConfig}
                />
            )}
            {activeTab === 'accuracy' && <Accuracy />}
            {activeTab === 'twitter-interactions' && (
                <DataTable<TwitterInteractionLog, TwitterInteractionLog>
                    config={twitterInteractionLogsConfig}
                />
            )}
        </div>
    );
};

export default App;
