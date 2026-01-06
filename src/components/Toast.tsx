import React, { useEffect, useState } from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';
import { CheckmarkIcon, XIcon, InfoIcon } from '@/components/Icons';

const Toast: React.FC<{ toast: ToastType; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const exitTimer = setTimeout(() => {
			setIsExiting(true);
		}, 4000);

		const removeTimer = setTimeout(() => {
			onRemove(toast.id);
		}, 4300);

		return () => {
			clearTimeout(exitTimer);
			clearTimeout(removeTimer);
		};
	}, [toast.id, onRemove]);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => onRemove(toast.id), 300);
	};

	const icons = {
		success: <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><CheckmarkIcon className="w-3 h-3 text-white" /></div>,
		error: <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"><XIcon className="w-3 h-3 text-white" /></div>,
		info: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><InfoIcon className="w-3 h-3 text-white" /></div>,
	};

	const titles = {
		success: 'Success',
		error: 'Error',
		info: 'Information'
	}

	return (
		<div
			className={`flex items-start w-full max-w-sm p-4 rounded-xl shadow-2xl border bg-bg-secondary border-border-primary ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
			role="alert"
		>
			<div className="flex-shrink-0">
				{icons[toast.type]}
			</div>
			<div className="ml-3 flex-1">
				<p className="text-sm font-semibold text-text-primary">{titles[toast.type]}</p>
				<p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
			</div>
			<button onClick={handleClose} className="ml-4 flex-shrink-0 p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-active" aria-label="Close">
				<XIcon className="w-4 h-4" />
			</button>
		</div>
	);
};

export const ToastContainer: React.FC = () => {
	const { toasts, removeToast } = useToast();

	return (
		<div className="fixed top-20 right-4 z-[100] space-y-3">
			{toasts.map(toast => (
				<Toast key={toast.id} toast={toast} onRemove={removeToast} />
			))}
		</div>
	);
};