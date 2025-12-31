"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeSelector = DateRangeSelector;
const react_icons_1 = require("@radix-ui/react-icons");
const date_fns_1 = require("date-fns");
const button_1 = require("@/components/ui/button");
const calendar_1 = require("@/components/ui/calendar");
const popover_1 = require("@/components/ui/popover");
const utils_1 = require("@/lib/utils");
const react_1 = require("react");
function DateRangeSelector() {
    const [date, setDate] = (0, react_1.useState)({
        from: new Date(2024, 0, 20),
        to: (0, date_fns_1.addDays)(new Date(2024, 0, 20), 20),
    });
    return (<div className="grid gap-2">
      <label htmlFor="date-range" className="text-sm font-medium">
        Rango de Fechas
      </label>
      <popover_1.Popover>
        <popover_1.PopoverTrigger asChild>
          <button_1.Button id="date-range" variant="outline" className={(0, utils_1.cn)("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <react_icons_1.CalendarIcon className="mr-2 h-4 w-4"/>
            {(date === null || date === void 0 ? void 0 : date.from) ? (date.to ? (<>
                  {(0, date_fns_1.format)(date.from, "LLL dd, y")} - {(0, date_fns_1.format)(date.to, "LLL dd, y")}
                </>) : ((0, date_fns_1.format)(date.from, "LLL dd, y"))) : (<span>Seleccionar rango</span>)}
          </button_1.Button>
        </popover_1.PopoverTrigger>
        <popover_1.PopoverContent className="w-auto p-0" align="start">
          <calendar_1.Calendar initialFocus mode="range" defaultMonth={date === null || date === void 0 ? void 0 : date.from} selected={date} onSelect={setDate} numberOfMonths={2}/>
        </popover_1.PopoverContent>
      </popover_1.Popover>
    </div>);
}
