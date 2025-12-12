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
exports.DavCalCalendar = void 0;
exports.initLib = initLib;
var tsdav_1 = require("tsdav");
var IcalCalendarEvent_1 = require("./IcalCalendarEvent");
var adapter;
function initLib(adapterInstance) {
    adapter = adapterInstance;
    (0, IcalCalendarEvent_1.initLib)(adapterInstance);
}
var DavCalCalendar = /** @class */ (function () {
    function DavCalCalendar(calConfig) {
        this.ignoreSSL = false;
        this.name = calConfig.name;
        var params = calConfig.authMethod == 'Oauth'
            ? {
                serverUrl: calConfig.serverUrl,
                credentials: {
                    tokenUrl: calConfig.tokenUrl,
                    username: calConfig.username,
                    refreshToken: calConfig.refreshToken,
                    clientId: calConfig.clientId,
                    clientSecret: calConfig.password,
                },
                authMethod: calConfig.authMethod,
                defaultAccountType: 'caldav',
            }
            : {
                serverUrl: calConfig.serverUrl,
                credentials: {
                    username: calConfig.username,
                    password: calConfig.password,
                },
                authMethod: 'Basic',
                defaultAccountType: 'caldav',
            };
        if (!params.serverUrl.endsWith('/')) {
            params.serverUrl += '/';
        }
        this.client = new tsdav_1.DAVClient(params);
        this.ignoreSSL = !!calConfig.ignoreSSL;
    }
    /**
     * load Calendars from Server
     *
     * @param displayName if set, try to return Calendar with this name
     * @returns Calender by displaName or last part of initial ServerUrl or first found Calendar
     */
    DavCalCalendar.prototype.getCalendar = function (displayName) {
        return __awaiter(this, void 0, void 0, function () {
            var calendars, displayNameLowerCase, i, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.calendar) return [3 /*break*/, 4];
                        if (!!this.client.account) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.login()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.client.fetchCalendars()];
                    case 3:
                        calendars = _a.sent();
                        //console.log(calendars)
                        if (displayName) {
                            displayNameLowerCase = displayName.toLocaleLowerCase();
                            for (i = 0; i < calendars.length; i++) {
                                if (calendars[i].displayName &&
                                    typeof calendars[i].displayName === 'string' &&
                                    calendars[i].displayName.toLowerCase() == displayNameLowerCase) {
                                    this.calendar = calendars[i];
                                    break;
                                }
                            }
                        }
                        else {
                            for (i = 0; i < calendars.length; i++) {
                                if (calendars[i].url == this.client.serverUrl) {
                                    this.calendar = calendars[i];
                                    break;
                                }
                            }
                        }
                        if (!this.calendar) {
                            this.calendar = calendars[0];
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.calendar];
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
    DavCalCalendar.prototype.getCalendarObjects = function (startDateISOString, endDateISOString) {
        return __awaiter(this, void 0, void 0, function () {
            var storeDefaultIgnoreSSL, searchParams;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        storeDefaultIgnoreSSL = null;
                        if (this.ignoreSSL && process.env.NODE_TLS_REJECT_UNAUTHORIZED != '0') {
                            storeDefaultIgnoreSSL = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                        }
                        _a = {};
                        return [4 /*yield*/, this.getCalendar()];
                    case 1:
                        searchParams = (_a.calendar = _b.sent(),
                            _a);
                        if (startDateISOString) {
                            searchParams.timeRange = {
                                start: startDateISOString,
                                end: endDateISOString || startDateISOString,
                            };
                        }
                        return [2 /*return*/, this.client.fetchCalendarObjects(searchParams).finally(function () {
                                if (storeDefaultIgnoreSSL !== null) {
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = storeDefaultIgnoreSSL;
                                }
                            })];
                }
            });
        });
    };
    /**
     * fetch Events form Calendar and pushed them to calEvents Array
     *
     * @param calEvents target Array of ICalendarEventBase
     * @param startDate as date object
     * @param endDate as date object
     * @returns null or errorstring
     */
    DavCalCalendar.prototype.loadEvents = function (calEvents, startDate, endDate) {
        var _this = this;
        return this.getCalendarObjects(startDate.toISOString(), endDate.toISOString())
            .then(function (calendarObjects) {
            if (calendarObjects) {
                adapter.log.info("found ".concat(calendarObjects.length, " calendar objects"));
                /* test for now update ...
                                    const calEvent = new CalendarEvent(calendarObjects[0].data);
                                    calEvent.startDate = dayjs().add(1, "minute");
                                    calEvent.endDate = dayjs().add(2, "minute");
                                    for (let evID in this.events) {
                                        this.events[evID].addCalendarEvent(calEvent, calEvent.getDays(startDate));
                                        break;
                                    }
                */
                for (var _i = 0, calendarObjects_1 = calendarObjects; _i < calendarObjects_1.length; _i++) {
                    var calObj = calendarObjects_1[_i];
                    var ev = IcalCalendarEvent_1.IcalCalendarEvent.fromData(calObj.data, _this.name, startDate, endDate);
                    if (ev) {
                        calEvents.push(ev);
                    }
                }
            }
            return null;
        })
            .catch(function (reason) {
            return reason.message;
        });
    };
    /**
     * add Event to Calendar
     *
     * @param data event data
     * @returns Server response, like {ok:boolen}
     */
    DavCalCalendar.prototype.addEvent = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var storeDefaultIgnoreSSL, result, calendarEventData, _a, _b, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        storeDefaultIgnoreSSL = null;
                        if (this.ignoreSSL && process.env.NODE_TLS_REJECT_UNAUTHORIZED != '0') {
                            storeDefaultIgnoreSSL = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        calendarEventData = IcalCalendarEvent_1.IcalCalendarEvent.createIcalEventString(data);
                        _b = (_a = this.client).createCalendarObject;
                        _c = {};
                        return [4 /*yield*/, this.getCalendar()];
                    case 2: return [4 /*yield*/, _b.apply(_a, [(_c.calendar = _d.sent(),
                                _c.filename = "".concat(data.id, ".ics"),
                                _c.iCalString = calendarEventData,
                                _c)])];
                    case 3:
                        result = _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _d.sent();
                        result = {
                            ok: false,
                            message: error_1,
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        if (storeDefaultIgnoreSSL !== null) {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = storeDefaultIgnoreSSL;
                        }
                        //console.log(result);
                        //console.log(result.ok);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DavCalCalendar.prototype.updateEvent = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var storeDefaultIgnoreSSL, result, calendarEventData, _a, _b, _c, error_2;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        storeDefaultIgnoreSSL = null;
                        if (this.ignoreSSL && process.env.NODE_TLS_REJECT_UNAUTHORIZED != '0') {
                            storeDefaultIgnoreSSL = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 4, , 5]);
                        calendarEventData = IcalCalendarEvent_1.IcalCalendarEvent.createIcalEventString(data);
                        _b = (_a = this.client).updateCalendarObject;
                        _d = {};
                        _e = {};
                        _c = "".concat;
                        return [4 /*yield*/, this.getCalendar()];
                    case 2: return [4 /*yield*/, _b.apply(_a, [(_d.calendarObject = (_e.url = _c.apply("", [(_f.sent()).url + data.id, ".ics"]),
                                _e.data = calendarEventData,
                                _e.etag = '',
                                _e),
                                _d)])];
                    case 3:
                        result = _f.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _f.sent();
                        result = {
                            ok: false,
                            message: error_2,
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        if (storeDefaultIgnoreSSL !== null) {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = storeDefaultIgnoreSSL;
                        }
                        //console.log(result);
                        //console.log(result.ok);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * delte Event from Calendar
     *
     * @param id event id
     * @returns Server response, like {ok:boolen}
     */
    DavCalCalendar.prototype.deleteEvent = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var storeDefaultIgnoreSSL, result, _a, _b, _c, error_3;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        storeDefaultIgnoreSSL = null;
                        if (this.ignoreSSL && process.env.NODE_TLS_REJECT_UNAUTHORIZED != '0') {
                            storeDefaultIgnoreSSL = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 4, , 5]);
                        _b = (_a = this.client).deleteCalendarObject;
                        _d = {};
                        _e = {};
                        _c = "".concat;
                        return [4 /*yield*/, this.getCalendar()];
                    case 2: return [4 /*yield*/, _b.apply(_a, [(_d.calendarObject = (_e.url = _c.apply("", [(_f.sent()).url + id, ".ics"]),
                                _e.etag = '',
                                _e),
                                _d)])];
                    case 3:
                        result = _f.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _f.sent();
                        result = {
                            ok: false,
                            message: error_3,
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        if (storeDefaultIgnoreSSL !== null) {
                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = storeDefaultIgnoreSSL;
                        }
                        //console.log(result);
                        //console.log(result.ok);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return DavCalCalendar;
}());
exports.DavCalCalendar = DavCalCalendar;
