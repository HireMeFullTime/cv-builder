import { useFieldArray } from "react-hook-form";
import { EditSectionControlProps } from "@/types";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";

export function EditSkillsSection({ control }: EditSectionControlProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "relevantSkills" as never, // react-hook-form type workaround for string array
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
        Key Skills
      </h3>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <FormField
              control={control}
              name={`relevantSkills.${index}`}
              render={({ field: inputField }) => (
                <FormItem className="flex-1 mb-0 space-y-0">
                  <FormControl>
                    <Input {...inputField} className="h-8 text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Move skill up"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Move skill down"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                aria-label="Remove skill"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
          className="mt-2 text-xs h-8"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Skill
        </Button>
      </div>
    </div>
  );
}
