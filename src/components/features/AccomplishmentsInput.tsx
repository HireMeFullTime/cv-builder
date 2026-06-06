"use client";

import { useState, KeyboardEvent, ClipboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, PlusCircle } from "lucide-react";
import { type Accomplishment } from "@/types";
export function AccomplishmentsInput({ 
  value = [], 
  onChange,
  placeholder = "e.g. Implemented CI/CD pipeline reducing build time by 50% (press Enter)"
}: { 
  value?: Accomplishment[]; 
  onChange: (value: Accomplishment[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission when pressing Enter
    if (e.key === "Enter") {
      e.preventDefault();
      addAccomplishment();
    }
  };

  const addAccomplishment = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      // Prevent exact duplicates just in case
      if (!value.some(acc => acc.value === trimmed)) {
        onChange([...value, { value: trimmed }]);
      }
      setInputValue("");
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    // We split by newlines. We do NOT split by commas because an accomplishment can contain commas.
    // We also remove common bullet points or dashes at the start of each line.
    const newItems = pastedText
      .split(/\n+/)
      .map(item => item.replace(/^[•\-\*]\s*/, "").trim())
      .filter(item => item.length > 0 && !value.some(acc => acc.value === item));

    if (newItems.length > 0) {
      const newAccomplishments = newItems.map(item => ({ value: item }));
      onChange([...value, ...newAccomplishments]);
    }
  };

  const removeAccomplishment = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((acc, index) => (
            <li key={index} className="flex items-start gap-2 bg-muted/30 p-2.5 border rounded-md text-sm">
              <span className="mt-0.5 text-muted-foreground font-bold">•</span>
              <span className="flex-1 leading-relaxed">{acc.value}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5 transition-colors"
                onClick={() => removeAccomplishment(index)}
                title="Remove"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          No items added yet. Type below and press Enter.
        </p>
      )}
      
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder={placeholder}
          aria-label="New accomplishment"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <Button 
          type="button" 
          variant="secondary" 
          onClick={addAccomplishment}
          className="shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Tip: You can paste a multi-line list (e.g., from LinkedIn) to add multiple accomplishments at once.
      </p>
    </div>
  );
}
