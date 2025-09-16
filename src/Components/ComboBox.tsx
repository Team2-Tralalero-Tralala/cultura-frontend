"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/Components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/Components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/Components/ui/popover"


type ComboBoxProps = {
  title: string
  value: string
  items: { value: string; label: string }[]
  onChange?: (value: string) => void
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export function Combobox({
  title = "",
  value = "",
  items = [],
  onChange = () => {},
  isOpen = false,
  onOpen = () => {},
  onClose = () => {}
}: ComboBoxProps) {
  const [_open, _setOpen] = React.useState(isOpen)
  const [_value, _setValue] = React.useState(value)

  const setOpen = (open: boolean) => {
    _setOpen(open)
    if (open) {
      onOpen()
    } else {
      onClose()
    }
  }

  const setValue = (value: string) => {
    _setValue(value)
    onChange(value)
  }

  return (
    <Popover open={_open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={_open}
          className="w-[200px] justify-between"
        >
          {_value
            ? items.find((item) => item.value === _value)?.label
            : `กรุณาเลือก${title}...`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`ค้นหา${title}...`} />
          <CommandList>
            <CommandEmpty>ไม่พบ{title}.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === _value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      _value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}