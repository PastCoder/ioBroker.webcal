"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = exports.Event = void 0;
var dayjs_1 = require("dayjs");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var regex_escape_1 = require("regex-escape");
var adapter;
var i18n = {};
var Event = /** @class */ (function () {
    function Event(config) {
        var _a;
        this.stateValues = {};
        this.nowFlag = null;
        this.name = config.name;
        this.id = this.name.replace(/[^a-z0-9_-]/gi, '');
        this.regEx = new RegExp(config.regEx || (0, regex_escape_1.default)(config.name), 'i');
        if (config.calendars) {
            this.calendars = [];
            for (var _i = 0, _b = config.calendars; _i < _b.length; _i++) {
                var calObj = _b[_i];
                if (calObj) {
                    this.calendars.push(calObj);
                }
            }
            if (!((_a = this.calendars) === null || _a === void 0 ? void 0 : _a.length)) {
                this.calendars = undefined;
            }
        }
        this.defaultCalendar = config.defaultCalendar;
        this.useIQontrol = !!config.useIQontrol;
    }
    Event.prototype.checkCalendarContent = function (content, calendarName) {
        if (calendarName && this.calendars && this.calendars.indexOf(calendarName) == -1) {
            return false;
        }
        return this.regEx.test(content) || content.indexOf(this.name) >= 0;
    };
    Event.prototype.addCalendarEvent = function (days) {
        var values;
        for (var d in days) {
            var day = d;
            //if (day >= -Event.daysPast && day <= Event.daysFuture) {
            values = this.stateValues[day];
            if (!values) {
                values = this.stateValues[day] = [];
            }
            values.push(days[day]);
            //}
        }
        adapter.log.silly("days for event '".concat(this.name, "': ").concat(JSON.stringify(this.stateValues)));
        var today = days[0];
        if (today) {
            // we have a hit today
            var startTime = today.startTime || '00:00';
            var endTime = today.endTime || '23:59';
            if (this.nowFlag) {
                if (!this.nowFlag.allDay) {
                    var curTime = null;
                    for (var i = 0; curTime == null && i < this.nowFlag.times.length; i++) {
                        curTime = this.nowFlag.times[i];
                        if (startTime < curTime.start) {
                            if (curTime.start > endTime) {
                                // hole timeframe is befor cur timeframe, so we insert it as new item
                                this.nowFlag.times.splice(i, 0, {
                                    start: startTime,
                                    end: endTime,
                                });
                            }
                            else {
                                // we will start earlier
                                curTime.start = startTime;
                                if (endTime > curTime.end) {
                                    // the endtime is later then cur timeframe, so we stopps later
                                    curTime.end = endTime;
                                }
                            }
                        }
                        else if (startTime == curTime.start || startTime < curTime.end) {
                            if (endTime > curTime.end) {
                                // the endtime is later then cur timeframe, so we stopps later
                                curTime.end = endTime;
                            }
                        }
                        else {
                            curTime = null;
                        }
                    }
                    if (curTime == null) {
                        this.nowFlag.times.push({
                            start: startTime,
                            end: endTime,
                        });
                    }
                    else if (curTime.start == '00:00' && curTime.end == '23:59') {
                        this.nowFlag.allDay = true;
                    }
                }
            }
            else {
                // first entry
                this.nowFlag = {
                    times: [],
                    timerID: null,
                    allDay: today.isAllday(),
                };
                if (!this.nowFlag.allDay) {
                    this.nowFlag.times.push({ start: startTime, end: endTime });
                }
            }
        }
    };
    Event.prototype.reset = function () {
        this.stateValues = {};
        if (this.nowFlag && this.nowFlag.timerID) {
            clearTimeout(this.nowFlag.timerID);
        }
        this.nowFlag = null;
    };
    Event.prototype.syncFlags = function () {
        var _this = this;
        adapter.getStatesAsync("".concat(Event.namespace + this.id, ".*")).then(function (states) {
            if (states) {
                for (var stateId in states) {
                    var evID = parseInt(stateId.split('.').pop() || '0', 10);
                    if (!isNaN(evID)) {
                        // datapoint is a number, so it will be a day state
                        adapter.setStateChangedAsync(stateId, (_this.stateValues[evID] || []).join(', '), true);
                    }
                }
            }
        });
        var jsonData = [];
        var next = new Date('9999-12-31');
        var now = new Date();
        for (var d in this.stateValues) {
            var dInt = parseInt(d, 10);
            var dateText = dInt < -1
                ? i18n.xDaysAgo.replace('%d', Math.abs(dInt).toString())
                : dInt == -1
                    ? i18n.yesterday
                    : dInt == 0
                        ? i18n.today
                        : dInt == 1
                            ? i18n.Tomorrow
                            : dInt > 1
                                ? i18n.inXDays.replace('%d', d)
                                : '';
            var times = this.stateValues[d];
            for (var i = 0; i < times.length; i++) {
                var time = __assign(__assign({}, times[i]), { timeText: times[i].toString(), dateText: dateText, dateEnd: ev.dateEnd ? ev.dateEnd.toISOString() : undefined });
                jsonData.push(time);
                if (time.date > now && time.date < next) {
                    next = time.date;
                }
            }
        }
        adapter.setStateChangedAsync("".concat(Event.namespace + this.id, ".data"), JSON.stringify(jsonData), true);
        adapter.setStateChangedAsync("".concat(Event.namespace + this.id, ".next"), next.getFullYear() < 9999 ? next.toISOString() : '', true);
        this.updateNowFlag();
    };
    Event.prototype.updateNowFlag = function () {
        var stateText = '';
        if (this.nowFlag) {
            if (this.nowFlag.timerID != null) {
                clearTimeout(this.nowFlag.timerID);
                this.nowFlag.timerID = null;
            }
            if (this.nowFlag.allDay) {
                stateText = i18n.allDay;
            }
            else {
                for (var i = 0; i < this.nowFlag.times.length; i++) {
                    var todayStr = (0, dayjs_1.default)().format('YYYY-MM-DDT');
                    var timeUntilStart = (0, dayjs_1.default)(todayStr + this.nowFlag.times[i].start).diff();
                    var timerUntilStop = (0, dayjs_1.default)(todayStr + this.nowFlag.times[i].end).diff();
                    if (timeUntilStart <= 0 && timerUntilStop > 0) {
                        // starttime is in the past and endTime is in the future
                        stateText =
                            this.nowFlag.times[i].start != '00:00' ? "".concat(i18n.from, " ").concat(this.nowFlag.times[i].start) : '';
                        stateText +=
                            this.nowFlag.times[i].end != '23:59'
                                ? "".concat((stateText ? ' ' : '') + i18n.until, " ").concat(this.nowFlag.times[i].end)
                                : '';
                        this.nowFlag.timerID = setTimeout(function (event) {
                            event.updateNowFlag();
                        }, timerUntilStop, this);
                        break;
                    }
                    else {
                        if (timeUntilStart > 0) {
                            // starttime is in the future
                            this.nowFlag.timerID = setTimeout(function (event) {
                                event.updateNowFlag();
                            }, timeUntilStart, this);
                            break;
                        }
                    }
                }
            }
        }
        adapter.setStateChangedAsync("".concat(Event.namespace + this.id, ".now"), stateText, true);
    };
    Event.namespace = 'events.';
    Event.daysFuture = 3;
    Event.daysPast = 0;
    return Event;
}());
exports.Event = Event;
var EventManager = /** @class */ (function () {
    function EventManager(adapterInstance, i18nInstance) {
        adapter = adapterInstance;
        i18n = i18nInstance;
        this.events = {};
        Event.namespace = "".concat(adapter.namespace, ".").concat(Event.namespace);
    }
    EventManager.prototype.init = function (config) {
        adapter.log.info('init events');
        Event.daysFuture = config.daysEventFuture;
        Event.daysPast = config.daysEventPast;
        // init all Events
        for (var i = 0; i < config.events.length; i++) {
            var event_1 = new Event(config.events[i]);
            this.events[event_1.id] = event_1;
        }
        this.syncEventStateObjects();
    };
    /**
     * create/update/delete all Event State objects based on config
     */
    EventManager.prototype.syncEventStateObjects = function () {
        var _this = this;
        var allEventIDs = {};
        for (var evID in this.events) {
            allEventIDs[evID] = true;
        }
        var eventFlags = {
            now: i18n.now,
            addEvent: i18n.addEvent,
            next: i18n.nextEvent,
            data: 'data',
            0: i18n.today,
        };
        for (var d = 1; d <= Event.daysPast; d++) {
            eventFlags[-d] = "".concat(i18n.today, " - ").concat(d, " ").concat(d == 1 ? i18n.day : i18n.days);
        }
        for (var d = 1; d <= Event.daysFuture; d++) {
            eventFlags[d] = "".concat(i18n.today, " + ").concat(d, " ").concat(d == 1 ? i18n.day : i18n.days);
        }
        adapter.getChannelsOf('events', function (_err, eventObjs) {
            if (eventObjs) {
                for (var e = 0; e < (eventObjs === null || eventObjs === void 0 ? void 0 : eventObjs.length); e++) {
                    var eventObj = eventObjs[e];
                    var evID = eventObj._id.split('.').pop() || '';
                    if (_this.events[evID]) {
                        delete allEventIDs[evID];
                        adapter.getStatesAsync("".concat(eventObj._id, ".*")).then(function (states) {
                            if (states) {
                                for (var stateId in states) {
                                    if (!eventFlags[stateId.split('.').pop() || '']) {
                                        adapter.log.info("delete flag ".concat(stateId));
                                        //this.delForeignObjectAsync(stateId);
                                        adapter.delObjectAsync(stateId);
                                    }
                                }
                            }
                        });
                        for (var id in eventFlags) {
                            _this.addEventFlagObject("".concat(eventObj._id, ".").concat(id), eventFlags[id]);
                        }
                    }
                    else {
                        adapter.log.info("delete event state ".concat(eventObj._id));
                        //this.delForeignObjectAsync(eventObj._id, { recursive: true });
                        adapter.delObjectAsync(eventObj._id, { recursive: true });
                    }
                }
            }
            var _loop_1 = function (evID) {
                adapter.log.info("create event ".concat(_this.events[evID].name));
                adapter.createChannel('events', evID, function (_err, eventObj) {
                    if (eventObj) {
                        adapter.extendObjectAsync(eventObj.id, {
                            common: {
                                name: _this.events[evID].name,
                            },
                        });
                        for (var id in eventFlags) {
                            _this.addEventFlagObject("".concat(eventObj.id, ".").concat(id), eventFlags[id]);
                        }
                    }
                });
            };
            for (var evID in allEventIDs) {
                _loop_1(evID);
            }
        });
        adapter.setTimeout(this.syncIQontrolStates.bind(this), 2000);
    };
    EventManager.prototype.addEventFlagObject = function (id, name) {
        var obj = {
            type: 'state',
            common: {
                name: name,
                type: 'string',
                role: 'text',
                read: true,
                write: false,
                def: '',
                desc: i18n.starttime,
            },
            native: {},
            _id: id,
        };
        if (id.endsWith('addEvent')) {
            obj.common.write = true;
            obj.common.desc = i18n.createNewEvent;
            var idTerms = id.split('.');
            if (this.events[idTerms[idTerms.length - 2]].useIQontrol) {
                obj.common.custom = {
                    'iqontrol.0': {
                        enabled: true,
                        statesAddInput: true,
                        statesAddInputCaption: i18n.dateOrPeriod,
                        showOnlyTargetValues: false,
                        type: 'string',
                        role: 'text',
                    },
                };
            }
        }
        else if (id.endsWith('data')) {
            obj.common.desc = 'data as JSON';
            obj.common.role = 'json';
        }
        adapter.setObjectAsync(id, obj);
    };
    EventManager.prototype.syncIQontrolStates = function () {
        if (this.iQontrolTimerID) {
            adapter.clearTimeout(this.iQontrolTimerID);
        }
        adapter.log.info('update addEvent-states');
        var iqontrolStates = {
            0: i18n.today,
            1: i18n.Tomorrow,
        };
        var d = new Date().getDay();
        for (var i = 2; i < 7; i++) {
            iqontrolStates[i.toString()] =
                "".concat(i18n["weekDaysFull".concat((d + i) % 7)], " ").concat(i18n.inXDays.replace('%d', i.toString()));
        }
        for (var id in this.events) {
            if (this.events[id].useIQontrol) {
                adapter.getObjectAsync("".concat(Event.namespace + id, ".addEvent")).then(function (eventObj) {
                    if (eventObj && eventObj.common.custom && eventObj.common.custom['iqontrol.0']) {
                        eventObj.common.custom['iqontrol.0'].states = iqontrolStates;
                        adapter.setObject(eventObj._id, eventObj);
                    }
                });
            }
        }
        var midNight = new Date();
        midNight.setDate(midNight.getDate() + 1);
        midNight.setHours(0, 10, 0);
        this.iQontrolTimerID = adapter.setTimeout(this.syncIQontrolStates.bind(this), midNight.getTime() - new Date().getTime());
    };
    EventManager.prototype.syncFlags = function () {
        for (var evID in this.events) {
            this.events[evID].syncFlags();
        }
    };
    EventManager.prototype.resetAll = function () {
        /*
        if (this.iQontrolTimerID) {
            clearTimeout(this.iQontrolTimerID);
        } */
        for (var evID in this.events) {
            this.events[evID].reset();
        }
    };
    return EventManager;
}());
exports.EventManager = EventManager;
