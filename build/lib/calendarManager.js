"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarManager = exports.CalendarEvent = exports.jsonEvent = exports.localTimeZone = void 0;
// @typescript-eslint/consistent-type-imports
var dayjs_1 = require("dayjs");
var timezone_1 = require("dayjs/plugin/timezone");
var utc_1 = require("dayjs/plugin/utc");
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(utc_1.default);
exports.localTimeZone = dayjs_1.default.tz.guess();
dayjs_1.default.tz.setDefault(exports.localTimeZone);
var adapter;
var i18n = {};
var jsonEvent = /** @class */ (function () {
    function jsonEvent(event, date, startTime, endTime, dateEnd) {
        this.id = event.id;
        this.calendarName = event.calendarName;
        this.summary = event.summary;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.dateEnd = dateEnd;
    }
    jsonEvent.prototype.toString = function () {
        return this.isAllday()
            ? i18n.allDay
            : (this.startTime ? "".concat(i18n.from, " ").concat(this.startTime) : '') +
                (this.endTime ? "".concat((this.startTime ? ' ' : '') + i18n.until, " ").concat(this.endTime) : '');
    };
    jsonEvent.prototype.isAllday = function () {
        return !this.startTime && !this.endTime;
    };
    return jsonEvent;
}());
exports.jsonEvent = jsonEvent;
var CalendarEvent = /** @class */ (function () {
    function CalendarEvent(endDate, calendarName, id) {
        this.id = id;
        this.calendarName = calendarName;
        this.maxUnixTime = (0, dayjs_1.default)(endDate).unix();
    }
    CalendarEvent.prototype.searchForEvents = function (events) {
        var content = (this.summary || '') + (this.description || '');
        if (content.length) {
            adapter.log.debug("check calendar(".concat(this.calendarName, ") event '").concat(this.summary || '', "' ").concat(this.description || ''));
            var eventHits = [];
            for (var evID in events) {
                var event_1 = events[evID];
                if (event_1.checkCalendarContent(content, this.calendarName)) {
                    adapter.log.debug("  found event '".concat(event_1.name, "' in calendar-event "));
                    eventHits.push(event_1);
                }
            }
            if (eventHits.length > 0) {
                var timeObj = this.getNextTimeObj(true);
                while (timeObj) {
                    var evTimeObj = {
                        start: (0, dayjs_1.default)(timeObj.startDate),
                        end: (0, dayjs_1.default)(timeObj.endDate),
                    };
                    var days = this.calcDays(evTimeObj);
                    for (var e = 0; e < eventHits.length; e++) {
                        eventHits[e].addCalendarEvent(days);
                    }
                    timeObj = this.getNextTimeObj(false);
                }
            }
        }
    };
    CalendarEvent.prototype.calcDays = function (timeObj) {
        var days = {};
        if (timeObj) {
            var firstDay = timeObj.start.startOf('D').diff(CalendarEvent.todayMidnight, 'd');
            var time = timeObj.start.format('HH:mm');
            var realEndDate = timeObj.end.toDate();
            if (!timeObj.start.isSame(timeObj.end)) {
                var lastDay = Math.min(timeObj.end.startOf('D').diff(CalendarEvent.todayMidnight, 'd'), CalendarEvent.daysFuture);
                var d = firstDay;
                if (firstDay < -CalendarEvent.daysPast) {
                    // Event start bevor timerange
                    d = -CalendarEvent.daysPast;
                }
                else if (time != '00:00') {
                    // Event start in timerange
                    days[firstDay] = new jsonEvent(this, timeObj.start.toDate(), time, undefined, realEndDate);
                    d++;
                }
                time = timeObj.end.format('HH:mm');
                if (time == '00:00') {
                    // we have midnight as endTime, so let use day before with 23:59
                    lastDay--;
                    time = '23:59';
                }
                for (; d <= lastDay; d++) {
                    days[d] = new jsonEvent(this, timeObj.start.add(d - firstDay, 'd').toDate(), undefined, undefined, realEndDate);
                }
                if (time != '23:59') {
                    if (days[lastDay]) {
                        days[lastDay].endTime = time;
                    }
                }
            }
            else if (firstDay >= -CalendarEvent.daysPast) {
                days[firstDay] = new jsonEvent(this, timeObj.start.toDate(), time != '00:00' ? time : undefined, time, realEndDate);
                time = timeObj.end.format('HH:mm');
                if (time != '23:59') {
                    //&& time != days[firstDay].startTime) {
                    days[firstDay].endTime = time;
                }
            }
            var days_string = JSON.stringify(days);
            if (days_string.length > 2) {
                adapter.log.debug("days for calendar-event(".concat(JSON.stringify(timeObj), "): ").concat(days_string));
            }
            else {
                adapter.log.silly("no days for calendar-event(".concat(JSON.stringify(timeObj), ") found "));
            }
        }
        return days;
    };
    CalendarEvent.parseDateTime = function (dateString) {
        var dateTimeObj = {
            // first we use year, minute and day numbers as index
            year: 0,
            month: 1,
            day: 2,
            hour: 0,
            minute: 0,
            second: 0,
            isDate: false,
        };
        var terms = dateString.split(/[./T :-]/);
        if (terms.length > 2) {
            if (terms[0].length != 4) {
                dateTimeObj.year = 2;
                if (dateString[2] == '.' || dateString[1] == '.') {
                    dateTimeObj.day = 0;
                    dateTimeObj.month = 1;
                }
                else {
                    if (parseInt(terms[0], 10) > 12) {
                        dateTimeObj.day = 0;
                        dateTimeObj.month = 1;
                    }
                    else {
                        dateTimeObj.month = 0;
                        dateTimeObj.day = 1;
                    }
                }
            } // else terms[0].length == 4 -> use default index
            dateTimeObj.year = parseInt(terms[dateTimeObj.year], 10);
            dateTimeObj.month = parseInt(terms[dateTimeObj.month], 10);
            dateTimeObj.day = parseInt(terms[dateTimeObj.day], 10);
            if (terms.length > 4) {
                dateTimeObj.hour = parseInt(terms[3], 10);
                dateTimeObj.minute = parseInt(terms[4], 10);
                if (dateTimeObj.hour < 12 && terms.length > 5) {
                    var hour12 = terms[5] + (terms.length > 6 ? terms[6] : '');
                    if (hour12.toLocaleLowerCase() == 'pm') {
                        dateTimeObj.hour += 12;
                    }
                }
            }
            else {
                dateTimeObj.isDate = true;
            }
            if (dateTimeObj.year < 100) {
                dateTimeObj.year += 2000;
            }
        }
        return dateTimeObj;
    };
    CalendarEvent.getDateTimeISOStringFromEventDateTime = function (date) {
        if (!date.isDate) {
            return new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second).toISOString();
        }
        return new String("20".concat(date.year))
            .slice(-4)
            .concat('-', new String("0".concat(date.month)).slice(-2), '-', new String("0".concat(date.day)).slice(-2));
    };
    CalendarEvent.daysFuture = 3;
    CalendarEvent.daysPast = 0;
    CalendarEvent.todayMidnight = (0, dayjs_1.default)().startOf('d');
    return CalendarEvent;
}());
exports.CalendarEvent = CalendarEvent;
var CalendarManager = /** @class */ (function () {
    function CalendarManager(adapterInstance, i18nInstance) {
        this.defaultCalendar = null;
        adapter = adapterInstance;
        i18n = i18nInstance;
        this.calendars = {};
    }
    CalendarManager.prototype.init = function (config) {
        CalendarEvent.daysFuture = Math.max(config.daysEventFuture || 0, config.daysJSONFuture || 0);
        CalendarEvent.daysPast = Math.max(config.daysEventPast || 0, config.daysJSONPast || 0);
    };
    CalendarManager.prototype.addCalendar = function (cal, name) {
        if (cal) {
            this.calendars[name] = cal;
            if (!this.defaultCalendar) {
                this.defaultCalendar = cal;
            }
        }
    };
    /**
     * get data from all calendars
     *
     * @returns Array of CalendarEvents
     */
    CalendarManager.prototype.fetchCalendars = function () {
        return __awaiter(this, void 0, void 0, function () {
            var calEvents, startDate, endDate, _a, _b, _c, _i, c, error;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        CalendarEvent.todayMidnight = (0, dayjs_1.default)().startOf('D');
                        calEvents = [];
                        startDate = CalendarEvent.todayMidnight.add(-CalendarEvent.daysPast, 'd').toDate();
                        endDate = CalendarEvent.todayMidnight.add(CalendarEvent.daysFuture, 'd').endOf('D').toDate();
                        _a = this.calendars;
                        _b = [];
                        for (_c in _a)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 4];
                        _c = _b[_i];
                        if (!(_c in _a)) return [3 /*break*/, 3];
                        c = _c;
                        adapter.log.debug("fetching Calendar ".concat(c));
                        return [4 /*yield*/, this.calendars[c].loadEvents(calEvents, startDate, endDate)];
                    case 2:
                        error = _d.sent();
                        if (error) {
                            adapter.log.error("could not fetch Calendar ".concat(c, ": ").concat(error));
                        }
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, calEvents];
                }
            });
        });
    };
    /**
     * create new Event in calendar
     *
     * @param data as eventdata
     * @param calendarName optional name of calendar, otherwise default calender is used
     * @returns Response Object
     */
    CalendarManager.prototype.addEvent = function (data, calendarName) {
        return __awaiter(this, void 0, void 0, function () {
            var calendar;
            return __generator(this, function (_a) {
                calendar = calendarName ? this.calendars[calendarName] : this.defaultCalendar;
                if (!calendar) {
                    return [2 /*return*/, { message: i18n.couldNotFoundCalendar + calendarName, errNo: 1, ok: false }];
                }
                adapter.log.debug("add Event to ".concat(calendar.name, ": ").concat(JSON.stringify(data)));
                return [2 /*return*/, calendar.addEvent(data)];
            });
        });
    };
    return CalendarManager;
}());
exports.CalendarManager = CalendarManager;
