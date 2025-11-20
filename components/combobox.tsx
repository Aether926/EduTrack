"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
    label: string;
    options: {
        value: string;
        label: string;
    }[];
    onChangeValue: (value: string) => void;
}

export function Combobox({ label, options, onChangeValue }: Props) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [inputValue, setInputValue] = React.useState("");

    const onValueSelect = (currentValue: string) => {
        setValue(currentValue === value ? "" : currentValue);
        setInputValue("");
        setOpen(false);
        onChangeValue(currentValue);
    };

    const handleAddCustom = () => {
        setValue(inputValue);
        setInputValue("");
        setOpen(false);
        onChangeValue(inputValue);
    };

    const isExistingValue = options.some(
        (item) => item.value.toLowerCase() === inputValue.toLowerCase()
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const canAddCustom = inputValue.trim().length > 0 && !isExistingValue;

    const handleInputChange = (val: string) => {
        setInputValue(val);

        console.log(isExistingValue, filteredOptions, canAddCustom);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? options.find((item) => item.value === value)?.label ||
                          value
                        : `${label}...`}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        onValueChange={handleInputChange}
                        placeholder={`Search ${label}...`}
                    />
                    <CommandList>
                        {filteredOptions.length === 0 && !canAddCustom && (
                            <CommandEmpty>No {label} found.</CommandEmpty>
                        )}
                        {filteredOptions.length > 0 && (
                            <CommandGroup>
                                {filteredOptions.map((options) => (
                                    <CommandItem
                                        key={options.value}
                                        value={options.value}
                                        onSelect={(currentValue) => {
                                            onValueSelect(currentValue);
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === options.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {options.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {canAddCustom && (
                            <CommandItem
                                value={inputValue}
                                onSelect={handleAddCustom}
                                className="cursor-pointer"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add &quot;{inputValue}&quot; as custom value
                            </CommandItem>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
