"use strict";
/*
 * Created with @iobroker/create-adapter v2.3.0
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
var utils = require("@iobroker/adapter-core");
var fs_1 = require("fs");
var calDav_1 = require("./lib/calDav");
var calendarManager_1 = require("./lib/calendarManager");
var eventManager_1 = require("./lib/eventManager");
var google_1 = require("./lib/google");
var iCalReadOnly_1 = require("./lib/iCalReadOnly");
var adapter;
var i18n = {
    allDay: 'all day',
    from: 'from',
    until: 'until',
    now: 'now',
    today: 'today',
    day: 'day',
    days: 'days',
    starttime: 'starttime',
    addEvent: 'add Event',
    createNewEvent: 'create new Event in calendar, see Readme',
    couldNotFoundCalendar: 'could not found calendar for',
    invalidDate: 'invalid date',
    invalidId: 'invalid id',
    undefinedError: 'undefined error',
    successfullyAdded: 'successfully added',
    successfullyDeleted: 'successfully deleted',
    successfullyUpdated: 'successfully updated',
    Tomorrow: 'Tomorrow',
    Yesterday: 'Yesterday',
    xDaysAgo: '%d days ago',
    inXDays: 'in %d days',
    dateOrPeriod: 'date or time period',
    nextEvent: 'next Event',
    weekDaysFull0: 'Sunday',
    weekDaysFull1: 'Monday',
    weekDaysFull2: 'Tuesday',
    weekDaysFull3: 'Wednesday',
    weekDaysFull4: 'Thursday',
    weekDaysFull5: 'Friday',
    weekDaysFull6: 'Saturday',
};
var Webcal = /** @class */ (function (_super) {
    __extends(Webcal, _super);
    function Webcal(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, __assign(__assign({}, options), { name: 'webcal' })) || this;
        _this.updateCalenderIntervall = undefined;
        _this.actionEvents = []; // we save this for internal housekeeping to fullfill PR addintg to iobroker repository
        _this.on('ready', _this.onReady.bind(_this));
        _this.on('stateChange', _this.onStateChange.bind(_this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        _this.on('message', _this.onMessage.bind(_this));
        _this.on('unload', _this.onUnload.bind(_this));
        _this.eventManager = new eventManager_1.EventManager(_this, i18n);
        _this.calendarManager = new calendarManager_1.CalendarManager(_this, i18n);
        return _this;
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    Webcal.prototype.onReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var c;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initLocales()];
                    case 1:
                        _a.sent();
                        this.eventManager.init(this.config);
                        this.calendarManager.init(this.config);
                        (0, calDav_1.initLib)(this);
                        (0, google_1.initLib)(this, calendarManager_1.localTimeZone);
                        (0, iCalReadOnly_1.initLib)(this);
                        if (this.config.calendars) {
                            for (c = 0; c < this.config.calendars.length; c++) {
                                this.calendarManager.addCalendar(this.createCalendarFromConfig(this.config.calendars[c]), this.config.calendars[c].name);
                            }
                            this.fetchCalendars();
                            if (this.config.intervall > 0) {
                                if (this.config.intervall < 10) {
                                    this.config.intervall = 10;
                                    adapter.log.info('minimum fetching time of calendar ar 10 minutes');
                                }
                                adapter.log.info("fetch calendar data all ".concat(this.config.intervall, " minutes"));
                                this.updateCalenderIntervall = this.setInterval(this.fetchCalendars.bind(this), this.config.intervall * 60000);
                            }
                        }
                        this.subscribeStates('fetchCal');
                        this.subscribeStates('events.*.addEvent');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * get data from all calendars and update Eventstates
     */
    Webcal.prototype.fetchCalendars = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.eventManager.resetAll();
                        return [4 /*yield*/, this.calendarManager.fetchCalendars().then(function (calEvents) {
                                for (var i = 0; i < calEvents.length; i++) {
                                    calEvents[i].searchForEvents(_this.eventManager.events);
                                }
                                _this.eventManager.syncFlags();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Webcal.prototype.createCalendarFromConfig = function (calConfig) {
        if (!calConfig.inactive) {
            if (calConfig.authMethod == 'Download') {
                this.log.info("create Download calendar: ".concat(calConfig.name));
                return new iCalReadOnly_1.ICalReadOnlyClient(calConfig);
            }
            else if (calConfig.password) {
                if (calConfig.authMethod == 'google') {
                    this.log.info("create google calendar: ".concat(calConfig.name));
                    return new google_1.GoogleCalendar(calConfig);
                }
                this.log.info("create DAV calendar: ".concat(calConfig.name));
                return new calDav_1.DavCalCalendar(calConfig);
            }
            this.log.warn("calendar ".concat(calConfig.name, " has no password set"));
        }
        else {
            this.log.info("calendar ".concat(calConfig.name, " is inactive"));
        }
        return null;
    };
    /**
     * create new Event in calendar
     *
     * @param expression Syntax relDays[@calendar] | date|datetime[ - date|datetime][@calendar]
     * relDays - number of days after today
     * date/datetime must be parsable date
     * \@calendar is the name of the calendar, if not use default (first defined calendar)
     * @param summary as string
     * @returns statusObject
     */
    Webcal.prototype.addEvent = function (expression, summary) {
        return __awaiter(this, void 0, void 0, function () {
            var terms, calendarName, eventData, days, date, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        adapter.log.debug("add event to calender: ".concat(expression));
                        terms = expression.split('@', 2);
                        expression = " ".concat(expression); // for formatting in msg
                        calendarName = terms.length > 1 ? terms[1] : ((_a = this.eventManager.events[summary]) === null || _a === void 0 ? void 0 : _a.defaultCalendar) || undefined;
                        eventData = {
                            summary: summary,
                            startDate: '',
                        };
                        if (terms[0].length < 4) {
                            days = parseInt(terms[0], 10);
                            if (!isNaN(days)) {
                                eventData.startDate = new Date(new Date().setDate(new Date().getDate() + days))
                                    .toISOString()
                                    .substring(0, 10);
                            }
                            else {
                                return [2 /*return*/, { statusText: i18n.invalidDate + expression, errNo: 4 }];
                            }
                        }
                        else {
                            terms = terms[0].split(' - ');
                            date = calendarManager_1.CalendarEvent.parseDateTime(terms[0]);
                            if (!date.year) {
                                return [2 /*return*/, { statusText: i18n.invalidDate + expression, errNo: 2 }];
                            }
                            eventData.startDate = date;
                            if (terms[1]) {
                                date = calendarManager_1.CalendarEvent.parseDateTime(terms[1]);
                                if (!date.year) {
                                    return [2 /*return*/, { statusText: i18n.invalidDate + expression, errNo: 3 }];
                                }
                                eventData.endDate = date;
                            }
                        }
                        return [4 /*yield*/, this.calendarManager.addEvent(eventData, calendarName)];
                    case 1:
                        result = _b.sent();
                        if (result.ok) {
                            return [2 /*return*/, { statusText: i18n.successfullyAdded + expression, errNo: 0 }];
                        }
                        return [2 /*return*/, { statusText: "".concat(result.message, " ").concat(expression), errNo: 5 }];
                }
            });
        });
    };
    /**
     * try to locale all internal used text
     */
    Webcal.prototype.initLocales = function () {
        return __awaiter(this, void 0, void 0, function () {
            var systemConfig, language, data, trans, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getForeignObjectAsync('system.config')];
                    case 1:
                        systemConfig = _a.sent();
                        if (systemConfig) {
                            language = systemConfig.common.language;
                            if (language) {
                                data = fs_1.default.readFileSync("./admin/i18n/".concat(language, "/translations.json"));
                                if (data) {
                                    try {
                                        trans = JSON.parse(data.toString());
                                        for (key in i18n) {
                                            if (trans[i18n[key]]) {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-ignore
                                                i18n[key] = trans[i18n[key]];
                                            }
                                        }
                                    }
                                    catch (error) {
                                        this.log.warn("error on loading translation, use english\n".concat(error));
                                    }
                                }
                                else {
                                    this.log.warn('could not load translation, use english');
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback as function
     */
    Webcal.prototype.onUnload = function (callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            if (this.updateCalenderIntervall) {
                this.clearInterval(this.updateCalenderIntervall);
            }
            this.eventManager.resetAll();
            if (this.eventManager.iQontrolTimerID) {
                this.clearTimeout(this.eventManager.iQontrolTimerID);
            }
            for (var i = 0; i < this.actionEvents.length; i++) {
                this.clearTimeout(this.actionEvents[i]);
            }
            callback();
        }
        catch (e) {
            this.log.warn("could n ot unload ".concat(e));
            callback();
        }
    };
    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    // 	if (obj) {
    // 		// The object was changed
    // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    // 	} else {
    // 		// The object was deleted
    // 		this.log.info(`object ${id} deleted`);
    // 	}
    // }
    /**
     * Is called if a subscribed state changes
     *
     * @param id id
     * @param state stateObj
     */
    Webcal.prototype.onStateChange = function (id, state) {
        var _this = this;
        if (!state || state.ack) {
            return;
        }
        // The state was changed
        this.log.info("state ".concat(id, " changed: ").concat(state.val));
        var stateId = id.split('.').pop();
        switch (stateId) {
            case 'fetchCal':
                if (state.val) {
                    this.fetchCalendars();
                    this.setState(id, false, true);
                }
                break;
            case 'addEvent':
                if (state.val) {
                    this.getObjectAsync(id.substring(0, id.lastIndexOf('.'))).then(function (obj) {
                        _this.addEvent(state.val, obj === null || obj === void 0 ? void 0 : obj.common.name).then(function (result) {
                            _this.setState(id, result.statusText, true);
                            _this.fetchCalendars();
                            var timerID = _this.addTimer(adapter.setTimeout(function () {
                                _this.setState(id, '', true);
                                if (timerID) {
                                    _this.clearTimer(timerID);
                                }
                            }, 60000));
                        });
                    });
                }
                break;
        }
    };
    Webcal.prototype.addTimer = function (timerID) {
        if (timerID) {
            this.actionEvents.push(timerID);
        }
        return timerID;
    };
    Webcal.prototype.clearTimer = function (timerID) {
        for (var i = 0; i < this.actionEvents.length; i++) {
            if (this.actionEvents[i] == timerID) {
                this.actionEvents.splice(i, 1);
            }
        }
    };
    /**
     * get calendar from Meassge-obj or default calendar. If not found a error to Message sender will send
     *
     * @param obj ioBroker Message
     * @returns Calendar or null
     */
    Webcal.prototype.getCalendarFromMessage = function (obj) {
        var calendar = obj.message.calendar
            ? this.calendarManager.calendars[obj.message.calendar]
            : this.calendarManager.defaultCalendar;
        if (!calendar) {
            return this.sendTo(obj.from, obj.command, { error: "".concat(i18n.couldNotFoundCalendar, " name: ").concat(obj.message.calendar) }, obj.callback);
        }
        return calendar;
    };
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  */
    Webcal.prototype.onMessage = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var calObj, error, calendars, c, calendar, _a, _b, _c, _i, i, event_1, result, calendar, _d, _e, _f, _g, i, event_2, result, calendar, _h, _j, _k, _l, i, event_3, result;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        this.log.debug(JSON.stringify(obj));
                        if (!(typeof obj === 'object')) return [3 /*break*/, 28];
                        if (!(obj.command === 'testCalendar')) return [3 /*break*/, 5];
                        if (!(obj.callback && obj.message)) return [3 /*break*/, 3];
                        calObj = this.createCalendarFromConfig(obj.message.calData);
                        if (!calObj) return [3 /*break*/, 2];
                        return [4 /*yield*/, calObj.loadEvents([], new Date(), new Date(new Date().setDate(new Date().getDate() + 15)))];
                    case 1:
                        error = _m.sent();
                        if (error) {
                            this.sendTo(obj.from, obj.command, { result: error }, obj.callback);
                        }
                        else {
                            this.sendTo(obj.from, obj.command, { result: 'success' }, obj.callback);
                        }
                        _m.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        this.sendTo(obj.from, obj.command, { result: 'could not create Calendar' }, obj.callback);
                        _m.label = 4;
                    case 4: return [3 /*break*/, 28];
                    case 5:
                        if (!(obj.command === 'getCalendars')) return [3 /*break*/, 6];
                        // Send response in callback if required
                        if (obj.callback) {
                            calendars = [];
                            for (c = 0; c < this.config.calendars.length; c++) {
                                calendars.push({ label: this.config.calendars[c].name, value: this.config.calendars[c].name });
                            }
                            this.sendTo(obj.from, obj.command, calendars, obj.callback);
                        }
                        else {
                            this.sendTo(obj.from, obj.command, [{ label: 'No calendar found', value: '' }], obj.callback);
                        }
                        return [3 /*break*/, 28];
                    case 6:
                        if (!(obj.command === 'addEvents')) return [3 /*break*/, 14];
                        if (!(typeof obj.message == 'object' && obj.message.events)) return [3 /*break*/, 12];
                        calendar = this.getCalendarFromMessage(obj);
                        if (!calendar) return [3 /*break*/, 11];
                        adapter.log.debug("add Events to ".concat(calendar.name));
                        _a = obj.message.events;
                        _b = [];
                        for (_c in _a)
                            _b.push(_c);
                        _i = 0;
                        _m.label = 7;
                    case 7:
                        if (!(_i < _b.length)) return [3 /*break*/, 10];
                        _c = _b[_i];
                        if (!(_c in _a)) return [3 /*break*/, 9];
                        i = _c;
                        event_1 = obj.message.events[i];
                        event_1.startDate = calendarManager_1.CalendarEvent.parseDateTime(event_1.start);
                        if (!event_1.startDate.year) {
                            event_1.error = "start: ".concat(i18n.invalidDate);
                        }
                        else {
                            if (event_1.end) {
                                event_1.endDate = calendarManager_1.CalendarEvent.parseDateTime(event_1.end);
                                if (!event_1.endDate.year) {
                                    event_1.error = "end: ".concat(i18n.invalidDate);
                                }
                            }
                        }
                        if (!!event_1.error) return [3 /*break*/, 9];
                        return [4 /*yield*/, calendar.addEvent(event_1)];
                    case 8:
                        result = _m.sent();
                        if (result.ok) {
                            event_1.status = i18n.successfullyAdded;
                        }
                        else {
                            event_1.error = result.message || result.statusText || i18n.undefinedError;
                        }
                        _m.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10:
                        this.fetchCalendars();
                        this.sendTo(obj.from, obj.command, obj.message.events, obj.callback);
                        _m.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12: return [2 /*return*/, this.sendTo(obj.from, obj.command, { error: 'found no events' }, obj.callback)];
                    case 13: return [3 /*break*/, 28];
                    case 14:
                        if (!(obj.command === 'updateEvents')) return [3 /*break*/, 22];
                        if (!(typeof obj.message == 'object' && obj.message.events)) return [3 /*break*/, 20];
                        calendar = this.getCalendarFromMessage(obj);
                        if (!calendar) return [3 /*break*/, 19];
                        adapter.log.debug("update Events to ".concat(calendar.name));
                        _d = obj.message.events;
                        _e = [];
                        for (_f in _d)
                            _e.push(_f);
                        _g = 0;
                        _m.label = 15;
                    case 15:
                        if (!(_g < _e.length)) return [3 /*break*/, 18];
                        _f = _e[_g];
                        if (!(_f in _d)) return [3 /*break*/, 17];
                        i = _f;
                        event_2 = obj.message.events[i];
                        if (!event_2.id) {
                            event_2.error = "id: ".concat(i18n.invalidId);
                        }
                        else {
                            if (event_2.start) {
                                event_2.startDate = calendarManager_1.CalendarEvent.parseDateTime(event_2.start);
                                if (!event_2.startDate.year) {
                                    event_2.error = "start: ".concat(i18n.invalidDate);
                                }
                            }
                            if (event_2.end) {
                                event_2.endDate = calendarManager_1.CalendarEvent.parseDateTime(event_2.end);
                                if (!event_2.endDate.year) {
                                    event_2.error = "end: ".concat(i18n.invalidDate);
                                }
                            }
                        }
                        if (!!event_2.error) return [3 /*break*/, 17];
                        return [4 /*yield*/, calendar.updateEvent(event_2)];
                    case 16:
                        result = _m.sent();
                        if (result.ok) {
                            event_2.status = i18n.successfullyUpdated;
                        }
                        else {
                            event_2.error = result.message || result.statusText || i18n.undefinedError;
                        }
                        _m.label = 17;
                    case 17:
                        _g++;
                        return [3 /*break*/, 15];
                    case 18:
                        this.fetchCalendars();
                        this.sendTo(obj.from, obj.command, obj.message.events, obj.callback);
                        _m.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20: return [2 /*return*/, this.sendTo(obj.from, obj.command, { error: 'found no events' }, obj.callback)];
                    case 21: return [3 /*break*/, 28];
                    case 22:
                        if (!(obj.command === 'deleteEvents')) return [3 /*break*/, 28];
                        if (!(typeof obj.message == 'object' && obj.message.events)) return [3 /*break*/, 27];
                        calendar = obj.message.calendar ? this.calendarManager.calendars[obj.message.calendar] : null;
                        if (!calendar) {
                            return [2 /*return*/, this.sendTo(obj.from, obj.command, { error: "".concat(i18n.couldNotFoundCalendar, " name: ").concat(obj.message.calendar) }, obj.callback)];
                        }
                        adapter.log.debug("delete Events from ".concat(calendar.name));
                        _h = obj.message.events;
                        _j = [];
                        for (_k in _h)
                            _j.push(_k);
                        _l = 0;
                        _m.label = 23;
                    case 23:
                        if (!(_l < _j.length)) return [3 /*break*/, 26];
                        _k = _j[_l];
                        if (!(_k in _h)) return [3 /*break*/, 25];
                        i = _k;
                        event_3 = obj.message.events[i];
                        if (!event_3.id) {
                            event_3.error = i18n.invalidId;
                        }
                        if (!!event_3.error) return [3 /*break*/, 25];
                        return [4 /*yield*/, calendar.deleteEvent(event_3.id)];
                    case 24:
                        result = _m.sent();
                        if (result.ok) {
                            event_3.status = i18n.successfullyDeleted;
                        }
                        else {
                            event_3.error = result.message || result.statusText || i18n.undefinedError;
                        }
                        _m.label = 25;
                    case 25:
                        _l++;
                        return [3 /*break*/, 23];
                    case 26:
                        this.fetchCalendars();
                        this.sendTo(obj.from, obj.command, obj.message.events, obj.callback);
                        return [3 /*break*/, 28];
                    case 27: return [2 /*return*/, this.sendTo(obj.from, obj.command, { error: 'found no events' }, obj.callback)];
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    return Webcal;
}(utils.Adapter));
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = function (options) { return (adapter = new Webcal(options)); };
}
else {
    // otherwise start the instance directly
    (function () { return (adapter = new Webcal()); })();
}
