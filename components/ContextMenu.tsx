import React from 'react';

interface Action {
    label: string;
    onClick: () => void;
}

interface ContextMenuProps {
    x: number;
    y: number;
    actions: Action[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions }) => {
    return (
        <div
            className="fixed z-50 bg-bg-secondary border border-border-primary rounded-md shadow-lg py-1 animate-scale-in"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
        >
            <ul>
                {actions.map((action, index) => (
                    <li key={index}>
                        <button
                            onClick={action.onClick}
                            className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
                        >
                            {action.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContextMenu;