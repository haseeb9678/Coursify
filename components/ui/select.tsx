"use client"

import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon, SearchIcon } from "lucide-react"

const Select = SelectPrimitive.Root
const selectTriggerClass =
  "flex w-fit max-w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
const selectPopupSize =
  "w-max min-w-[min(max(9rem,var(--anchor-width)),24rem,calc(100dvw-2rem))] max-w-[min(24rem,var(--available-width),calc(100dvw-2rem))] max-h-[min(20rem,var(--available-height))]"
const selectOptionClass =
  "grid w-full cursor-default grid-cols-[minmax(0,1fr)_1rem] items-center gap-2 rounded-md px-2 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
const selectOptionTextClass = "min-w-0 wrap-anywhere whitespace-normal"

const SelectPortalContainerContext =
  React.createContext<React.RefObject<HTMLElement | null> | null>(null)

function SelectPortalContainerProvider({
  containerRef,
  children,
}: {
  containerRef: React.RefObject<HTMLElement | null>
  children: React.ReactNode
}) {
  return (
    <SelectPortalContainerContext.Provider value={containerRef}>
      {children}
    </SelectPortalContainerContext.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("min-w-0 flex-1 truncate text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTriggerClass, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  const portalContainerRef = React.useContext(SelectPortalContainerContext)

  return (
    <SelectPrimitive.Portal container={portalContainerRef ?? undefined}>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(selectPopupSize, "relative isolate z-50 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className)}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectOptionClass, className)}
      {...props}
    >
      <SelectPrimitive.ItemText className={selectOptionTextClass}>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="pointer-events-none col-start-2 text-primary">
        <CheckIcon className="block size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SearchableSelectOption = { value: string; label: string; disabled?: boolean }

function SearchableSelect({
  options,
  value,
  onValueChange,
  disabled,
  placeholder = "Select an option",
  className,
  ...triggerProps
}: Pick<Combobox.Trigger.Props, "id" | "aria-label" | "aria-invalid" | "aria-describedby" | "className"> & {
  options: readonly SearchableSelectOption[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const portalContainerRef = React.useContext(SelectPortalContainerContext)
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <Combobox.Root items={options} value={selected} disabled={disabled} autoHighlight
      onValueChange={(option) => { if (option) onValueChange(option.value) }}>
      <Combobox.Trigger data-slot="select-trigger" data-size="default" className={cn(selectTriggerClass, className)} {...triggerProps}>
        <Combobox.Value>{() => <span data-slot="select-value" className="min-w-0 flex-1 truncate text-left" title={selected?.label}>{selected?.label ?? placeholder}</span>}</Combobox.Value>
        <ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground" />
      </Combobox.Trigger>
      <Combobox.Portal container={portalContainerRef ?? undefined}>
        <Combobox.Positioner align="start" sideOffset={6} className="isolate z-50">
          <Combobox.Popup data-slot="select-content" className={cn(selectPopupSize, "flex flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl")}>
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 text-muted-foreground">
              <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
              <Combobox.Input aria-label="Search options" placeholder="Search options…" size={12} className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <Combobox.Empty className="px-3 py-3 text-sm text-muted-foreground empty:hidden">No matching options</Combobox.Empty>
            <Combobox.List className="min-h-0 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0">
              {(option: SearchableSelectOption) => (
                <Combobox.Item key={option.value} value={option} disabled={option.disabled} data-slot="select-item"
                  className={cn(selectOptionClass, "min-h-10 rounded-lg px-3 py-2.5 font-medium data-selected:bg-primary/10 data-selected:text-primary")}>
                  <span className={selectOptionTextClass}>{option.label}</span>
                  <Combobox.ItemIndicator className="pointer-events-none col-start-2 text-primary">
                    <CheckIcon className="block size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  SearchableSelect,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortalContainerProvider,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
