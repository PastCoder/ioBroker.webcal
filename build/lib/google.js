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
exports.GoogleCalendar = exports.GoogleCalendarEvent = void 0;
exports.initLib = initLib;
var calendar_1 = require("@googleapis/calendar");
var oauth2_1 = require("@googleapis/oauth2");
var calendarManager_1 = require("./calendarManager");
//const scope = "https://www.googleapis.com/auth/calendar";
var adapter;
var localTimeZone;
function initLib(adapterInstance, adapterLocalTimeZone) {
    adapter = adapterInstance;
    localTimeZone = adapterLocalTimeZone;
}
var GoogleCalendarEvent = /** @class */ (function (_super) {
    __extends(GoogleCalendarEvent, _super);
    function GoogleCalendarEvent(googleEvent, calendarName, endDate) {
        var _this = _super.call(this, endDate, calendarName, googleEvent.id || null) || this;
        _this.googleEvent = googleEvent;
        try {
            _this.summary = googleEvent.summary || '';
            _this.description = googleEvent.description || '';
        }
        catch (error) {
            adapter.log.error("could not read calendar Event: ".concat(error));
            adapter.log.debug(JSON.stringify(googleEvent));
            _this.googleEvent = null;
        }
        return _this;
    }
    GoogleCalendarEvent.prototype.getNextTimeObj = function (isFirstCall) {
        if (!this.googleEvent || !isFirstCall) {
            return null;
        }
        var start;
        var end;
        if (this.googleEvent.start) {
            if (this.googleEvent.start.date) {
                start = new Date("".concat(this.googleEvent.start.date, "T00:00"));
            }
            else {
                start = new Date(this.googleEvent.start.dateTime || '');
            }
        }
        else {
            start = new Date();
        }
        if (this.googleEvent.end) {
            if (this.googleEvent.end.date) {
                end = new Date("".concat(this.googleEvent.end.date, "T23:59"));
            }
            else {
                end = new Date(this.googleEvent.end.dateTime || '');
            }
        }
        else {
            end = new Date();
        }
        return {
            startDate: start,
            endDate: end,
        };
    };
    return GoogleCalendarEvent;
}(calendarManager_1.CalendarEvent));
exports.GoogleCalendarEvent = GoogleCalendarEvent;
var GoogleCalendar = /** @class */ (function () {
    function GoogleCalendar(calConfig) {
        this.name = calConfig.name;
        this.auth = new oauth2_1.auth.OAuth2(calConfig.clientId, calConfig.password);
        this.auth.setCredentials({
            refresh_token: calConfig.refreshToken,
        });
        this.client = (0, calendar_1.calendar)({
            version: 'v3',
            auth: this.auth,
        });
    }
    /**
     * load Calendars from Server
     *
     * @param displayName if set, try to return Calendar with this name
     * @returns Calender by displaName or primary Calendar
     */
    GoogleCalendar.prototype.getCalendar = function (displayName) {
        return __awaiter(this, void 0, void 0, function () {
            var res, calendars, displayNameLowerCase, i, i;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!this.calendarId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.calendarList.list()];
                    case 1:
                        res = _c.sent();
                        if (res && res.data && res.data.items) {
                            calendars = res.data.items;
                            //console.log(calendars)
                            if (!displayName) {
                                displayName = this.name;
                            }
                            if (displayName) {
                                displayNameLowerCase = displayName.toLocaleLowerCase();
                                for (i = 0; i < calendars.length; i++) {
                                    if (((_a = calendars[i].summary) === null || _a === void 0 ? void 0 : _a.toLowerCase()) == displayNameLowerCase ||
                                        ((_b = calendars[i].summaryOverride) === null || _b === void 0 ? void 0 : _b.toLowerCase()) == displayNameLowerCase) {
                                        this.calendarId = calendars[i].id || '';
                                        adapter.log.info("use google calendar ".concat(this.calendarId));
                                        return [2 /*return*/, this.calendarId];
                                    }
                                }
                            }
                            for (i = 0; i < calendars.length; i++) {
                                if (calendars[i].primary) {
                                    this.calendarId = calendars[i].id || '';
                                    adapter.log.info("use google primary calendar ".concat(this.calendarId));
                                    break;
                                }
                            }
                        }
                        _c.label = 2;
                    case 2: return [2 /*return*/, this.calendarId || ''];
                }
            });
        });
    };
    /**
     * fetch Events form Calendar
     *
     * @param startDateISOString as date object
     * @param endDateISOString as date object
     * @returns Array of Calenderobjects
     */
    GoogleCalendar.prototype.getCalendarObjects = function (startDateISOString, endDateISOString) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.getCalendar()];
                    case 1:
                        searchParams = (_a.calendarId = _b.sent(),
                            _a.singleEvents = true,
                            _a.orderBy = 'startTime',
                            _a.timeZone = localTimeZone,
                            _a);
                        if (startDateISOString) {
                            searchParams.timeMin = startDateISOString;
                            searchParams.timeMax = endDateISOString;
                        }
                        return [2 /*return*/, this.client.events.list(searchParams)];
                }
            });
        });
    };
    GoogleCalendar.prototype.loadEvents = function (calEvents, startDate, endDate) {
        var _this = this;
        return this.getCalendarObjects(startDate.toISOString(), endDate.toISOString())
            .then(function (res) {
            var _a;
            var calendarObjects = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.items;
            if (calendarObjects) {
                adapter.log.info("found ".concat(calendarObjects.length, " calendar objects"));
                for (var _i = 0, calendarObjects_1 = calendarObjects; _i < calendarObjects_1.length; _i++) {
                    var calObj = calendarObjects_1[_i];
                    calEvents.push(new GoogleCalendarEvent(calObj, _this.name, endDate));
                }
            }
            return null;
        })
            .catch(function (reason) {
            return reason.message;
        });
    };
    GoogleCalendar.prototype.addEvent = function (calEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var result, start, data, end, res, _a, _b, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        start = typeof calEvent.startDate == 'string'
                            ? calEvent.startDate
                            : calendarManager_1.CalendarEvent.getDateTimeISOStringFromEventDateTime(calEvent.startDate);
                        data = {
                            summary: calEvent.summary,
                            description: calEvent.description || 'ioBroker webCal',
                        };
                        if (start.length > 10) {
                            data.start = { dateTime: start, timeZone: localTimeZone };
                        }
                        else {
                            data.start = { date: start };
                        }
                        if (calEvent.endDate) {
                            end = typeof calEvent.endDate == 'string'
                                ? calEvent.endDate
                                : calendarManager_1.CalendarEvent.getDateTimeISOStringFromEventDateTime(calEvent.endDate);
                            if (end.length > 10) {
                                data.end = { dateTime: end, timeZone: localTimeZone };
                            }
                            else {
                                data.end = { date: end };
                            }
                        }
                        else {
                            data.end = data.start;
                        }
                        if (calEvent.location) {
                            data.location = calEvent.location;
                        }
                        if (calEvent.organizer) {
                            data.organizer = { displayName: calEvent.organizer };
                        }
                        if (calEvent.color) {
                            data.colorId = calEvent.color;
                        }
                        _b = (_a = this.client.events).insert;
                        _c = {};
                        return [4 /*yield*/, this.getCalendar()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [(_c.calendarId = _d.sent(),
                                _c.requestBody = data,
                                _c)])];
                    case 2:
                        res = _d.sent();
                        result = {
                            ok: !!res.data,
                            message: res.statusText,
                        };
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        result = {
                            ok: false,
                            message: error_1.message,
                        };
                        return [3 /*break*/, 4];
                    case 4: 
                    //console.log(result);
                    //console.log(result.ok);
                    return [2 /*return*/, result];
                }
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    GoogleCalendar.prototype.updateEvent = function (calEvent) {
        throw new Error('Method not implemented.');
    };
    /**
     * delete Event from Calendar
     *
     * @param id event id
     * @returns Server response, like {ok:boolen}
     */
    GoogleCalendar.prototype.deleteEvent = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, res, _a, _b, error_2;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _b = (_a = this.client.events).delete;
                        _c = {};
                        return [4 /*yield*/, this.getCalendar()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [(_c.calendarId = _d.sent(),
                                _c.eventId = id,
                                _c)])];
                    case 2:
                        res = _d.sent();
                        result = {
                            ok: res.status >= 200 && res.status < 300,
                            message: res.statusText,
                        };
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _d.sent();
                        result = {
                            ok: false,
                            message: error_2.message,
                        };
                        return [3 /*break*/, 4];
                    case 4: 
                    //console.log(result);
                    //console.log(result.ok);
                    return [2 /*return*/, result];
                }
            });
        });
    };
    return GoogleCalendar;
}());
exports.GoogleCalendar = GoogleCalendar;
