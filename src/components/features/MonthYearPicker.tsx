'use client';

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentYear = new Date().getFullYear();

const YEARS = Array.from({length: 55}, (_, i) => currentYear + 5 - i);

import {useEffect} from 'react';

export function MonthYearPicker({
	value,
	onChange,
	minDate
}: {
	value?: Date;
	onChange: (date: Date | undefined) => void;
	minDate?: Date;
}) {
	const selectedMonth = value ? new Date(value).getUTCMonth().toString() : '';
	const selectedYear = value ? new Date(value).getUTCFullYear().toString() : '';

	useEffect(() => {
		if (value && minDate) {
			const valDate = new Date(value);
			const minD = new Date(minDate);
			if (
				valDate.getUTCFullYear() < minD.getUTCFullYear() ||
				(valDate.getUTCFullYear() === minD.getUTCFullYear() && valDate.getUTCMonth() < minD.getUTCMonth())
			) {
				onChange(minD);
			}
		}
	}, [value, minDate, onChange]);

	const handleMonthChange = (monthStr: string) => {
		const m = parseInt(monthStr, 10);
		if (selectedYear) {
			onChange(new Date(Date.UTC(parseInt(selectedYear, 10), m, 1)));
		} else {
			onChange(new Date(Date.UTC(currentYear, m, 1)));
		}
	};

	const handleYearChange = (yearStr: string) => {
		const y = parseInt(yearStr, 10);
		if (selectedMonth) {
			onChange(new Date(Date.UTC(y, parseInt(selectedMonth, 10), 1)));
		} else {
			onChange(new Date(Date.UTC(y, 0, 1)));
		}
	};

	return (
		<div className='flex gap-1 w-full'>
			<Select value={selectedMonth} onValueChange={handleMonthChange}>
				<SelectTrigger className='w-full px-2 text-sm'>
					<SelectValue placeholder='Month' />
				</SelectTrigger>
				<SelectContent>
					{MONTHS.map((month, index) => {
						const minD = minDate ? new Date(minDate) : null;
						const disabled =
							minD && selectedYear && parseInt(selectedYear, 10) === minD.getUTCFullYear()
								? index < minD.getUTCMonth()
								: false;
						return (
							<SelectItem key={index} value={index.toString()} disabled={disabled}>
								{month}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			<Select value={selectedYear} onValueChange={handleYearChange}>
				<SelectTrigger className='w-full px-2 text-sm'>
					<SelectValue placeholder='Year' />
				</SelectTrigger>
				<SelectContent>
					{YEARS.map(year => {
						const minD = minDate ? new Date(minDate) : null;
						const disabled = minD ? year < minD.getUTCFullYear() : false;
						return (
							<SelectItem key={year} value={year.toString()} disabled={disabled}>
								{year}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}
