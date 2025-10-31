interface CardProps {
    title: string;
    value: string;
    icon: string;
    description: string;
}

export function Card({title,value,icon,description}: CardProps){ 
    return (
        <div className="bg-white rounded-lg shadow-md p-6 border-1-4 border-blue-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
                <div className="text-3xl">{icon}</div>
            </div>
        </div>
    )
}