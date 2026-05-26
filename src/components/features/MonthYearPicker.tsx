"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
// Generate years from current year + 5 to 50 years ago
const YEARS = Array.from({ length: 55 }, (_, i) => currentYear + 5 - i);

export function MonthYearPicker({ 
  value, 
  onChange 
}: { 
  value?: Date; 
  onChange: (date: Date | undefined) => void;
}) {
  const selectedMonth = value ? value.getMonth().toString() : "";
  const selectedYear = value ? value.getFullYear().toString() : "";

  const handleMonthChange = (monthStr: string) => {
    const m = parseInt(monthStr, 10);
    if (selectedYear) {
      onChange(new Date(parseInt(selectedYear, 10), m, 1));
    } else {
      onChange(new Date(currentYear, m, 1));
    }
  };

  const handleYearChange = (yearStr: string) => {
    const y = parseInt(yearStr, 10);
    if (selectedMonth) {
      onChange(new Date(y, parseInt(selectedMonth, 10), 1));
    } else {
      onChange(new Date(y, 0, 1));
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={index} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
