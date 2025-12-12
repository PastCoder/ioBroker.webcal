"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcalCalendarEvent = void 0;
exports.initLib = initLib;
exports.getAllIcalCalendarEvents = getAllIcalCalendarEvents;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var ical_js_1 = require("ical.js");
var calendarManager_1 = require("./calendarManager");
var adapter;
function initLib(adapterInstance) {
    adapter = adapterInstance;
    //ICAL.Timezone.localTimezone = new ICAL.Timezone({ tzID: localTimeZone });
}
function getAllIcalCalendarEvents(calendarEventData, calendarName, startDate, endDate, checkDateRange) {
    var result = [];
    try {
        adapter.log.silly("parse calendar data:\n".concat(calendarEventData.replace(/\s*([:;=])\s*/gm, '$1')));
        var jcalData = ical_js_1.default.parse(calendarEventData);
        var comp = new ical_js_1.default.Component(jcalData);
        var calTimezoneComp = comp.getFirstSubcomponent('vtimezone');
        var calTimezone = calTimezoneComp ? new ical_js_1.default.Timezone(calTimezoneComp) : null;
        var allEvents = comp.getAllSubcomponents('vevent');
        for (var _i = 0, allEvents_1 = allEvents; _i < allEvents_1.length; _i++) {
            var event_1 = allEvents_1[_i];
            var ev = new IcalCalendarEvent(event_1, calTimezone, calendarName, startDate, endDate);
            if (ev) {
                if (checkDateRange) {
                    var timeObj = ev.getNextTimeObj(true);
                    if (!timeObj || timeObj.startDate < startDate || timeObj.endDate > endDate) {
                        continue;
                    }
                }
                result.push(ev);
            }
        }
    }
    catch (error) {
        adapter.log.error("could not read calendar Event: ".concat(error));
    }
    return result;
}
var IcalCalendarEvent = /** @class */ (function (_super) {
    __extends(IcalCalendarEvent, _super);
    function IcalCalendarEvent(eventComp, calTimezone, calendarName, startDate, endDate) {
        var _this = _super.call(this, endDate, calendarName, null) || this;
        _this.timezone = calTimezone;
        try {
            _this.icalEvent = new ical_js_1.default.Event(eventComp);
            _this.summary = _this.icalEvent.summary || '';
            _this.description = _this.icalEvent.description || '';
            _this.id = _this.icalEvent.uid;
            if (_this.icalEvent.isRecurring()) {
                _this.recurIterator = _this.icalEvent.iterator();
                /*
                if (!["HOURLY", "SECONDLY", "MINUTELY"].includes(this.icalEvent.getRecurrenceTypes())) {
                    const timeObj = this.getNextTimeObj(true);
                    if (timeObj) {
                        const startTime = ICAL.Time.fromData(
                            {
                                year: startDate.getFullYear(),
                                month: startDate.getMonth() + 1,
                                day: startDate.getDate() - 1,
                                hour: timeObj.startDate.getHours(),
                                minute: timeObj.startDate.getMinutes(),
                            },
                            this.timezone,
                        );
                        this.recurIterator = this.icalEvent.iterator();
                        this.recurIterator.next(startTime);
                    }
                }
                */
            }
        }
        catch (error) {
            adapter.log.error("could not read calendar Event: ".concat(error));
            _this.icalEvent = undefined;
        }
        return _this;
    }
    IcalCalendarEvent.fromData = function (calendarEventData, calendarName, startDate, endDate) {
        try {
            adapter.log.debug("parse calendar data:\n".concat(calendarEventData));
            var optimizedData = calendarEventData.replace(/X-[\s\S]*?(?=[A-Z-]+:)/gm, '');
            if (optimizedData.length != calendarEventData.length) {
                adapter.log.debug("use corrected data :\n".concat(optimizedData));
            }
            var jcalData = ical_js_1.default.parse(optimizedData);
            var comp = new ical_js_1.default.Component(jcalData);
            var calTimezone = comp.getFirstSubcomponent('vtimezone');
            return new IcalCalendarEvent(comp.getFirstSubcomponent('vevent') || undefined, calTimezone ? new ical_js_1.default.Timezone(calTimezone) : null, calendarName, startDate, endDate);
        }
        catch (error) {
            adapter.log.error("could not read calendar Event: ".concat(error));
            return null;
        }
    };
    IcalCalendarEvent.prototype.getNextTimeObj = function (isFirstCall) {
        var start;
        var end;
        if (!this.icalEvent) {
            return null;
        }
        if (this.recurIterator) {
            if (isFirstCall) {
                this.recurIterator = this.icalEvent.iterator();
            }
            start = this.recurIterator.next();
            if (start) {
                if (this.timezone) {
                    start = start.convertToZone(this.timezone);
                }
                if (start.toUnixTime() > this.maxUnixTime) {
                    return null;
                }
                try {
                    end = this.icalEvent.getOccurrenceDetails(start).endDate;
                }
                catch (error) {
                    adapter.log.error("could not get next Time Object: ".concat(error));
                    return null;
                }
            }
            else {
                return null;
            }
        }
        else if (isFirstCall) {
            start = this.icalEvent.startDate;
            if (this.timezone) {
                start = start.convertToZone(this.timezone);
            }
            end = this.icalEvent.endDate;
        }
        else {
            return null;
        }
        if (this.timezone) {
            end = end.convertToZone(this.timezone);
        }
        return {
            startDate: start.toJSDate(), //.local();
            endDate: end.toJSDate(), //.local();
        };
    };
    IcalCalendarEvent.createIcalEventString = function (data) {
        var cal = new ical_js_1.default.Component(['vcalendar', [], []]);
        cal.updatePropertyWithValue('prodid', '-//ioBroker.webCal');
        var vevent = new ical_js_1.default.Component('vevent');
        var event = new ical_js_1.default.Event(vevent);
        if (!data.id) {
            data.id = "iob_".concat(new Date().getTime());
        }
        event.summary = data.summary;
        event.description = data.description || 'ioBroker webCal';
        event.uid = data.id;
        event.startDate =
            typeof data.startDate == 'string'
                ? ical_js_1.default.Time.fromString(data.startDate, null)
                : ical_js_1.default.Time.fromData(data.startDate);
        if (data.endDate) {
            event.endDate =
                typeof data.endDate == 'string'
                    ? ical_js_1.default.Time.fromString(data.endDate, null)
                    : ical_js_1.default.Time.fromData(data.endDate);
        }
        if (data.location) {
            event.location = data.location;
        }
        if (data.organizer) {
            event.organizer = data.organizer;
        }
        if (data.color) {
            event.color = data.color;
        }
        cal.addSubcomponent(vevent);
        return cal.toString();
    };
    return IcalCalendarEvent;
}(calendarManager_1.CalendarEvent));
exports.IcalCalendarEvent = IcalCalendarEvent;
