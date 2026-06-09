var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/main.ts
__export(exports, {
  default: () => BookmarkBridgePlugin
});
var import_obsidian2 = __toModule(require("obsidian"));

// node_modules/twitter-api-v2/dist/esm/globals.js
var API_V2_PREFIX = "https://api.x.com/2/";
var API_V2_LABS_PREFIX = "https://api.x.com/labs/2/";
var API_V1_1_PREFIX = "https://api.x.com/1.1/";
var API_V1_1_UPLOAD_PREFIX = "https://upload.x.com/1.1/";
var API_V1_1_STREAM_PREFIX = "https://stream.x.com/1.1/";
var API_ADS_PREFIX = "https://ads-api.x.com/12/";
var API_ADS_SANDBOX_PREFIX = "https://ads-api-sandbox.twitter.com/12/";

// node_modules/twitter-api-v2/dist/esm/paginators/TwitterPaginator.js
var TwitterPaginator = class {
  constructor({ realData, rateLimit, instance, queryParams, sharedParams }) {
    this._maxResultsWhenFetchLast = 100;
    this._realData = realData;
    this._rateLimit = rateLimit;
    this._instance = instance;
    this._queryParams = queryParams;
    this._sharedParams = sharedParams;
  }
  get _isRateLimitOk() {
    if (!this._rateLimit) {
      return true;
    }
    const resetDate = this._rateLimit.reset * 1e3;
    if (resetDate < Date.now()) {
      return true;
    }
    return this._rateLimit.remaining > 0;
  }
  makeRequest(queryParams) {
    return this._instance.get(this.getEndpoint(), queryParams, { fullResponse: true, params: this._sharedParams });
  }
  makeNewInstanceFromResult(result, queryParams) {
    return new this.constructor({
      realData: result.data,
      rateLimit: result.rateLimit,
      instance: this._instance,
      queryParams,
      sharedParams: this._sharedParams
    });
  }
  getEndpoint() {
    return this._endpoint;
  }
  injectQueryParams(maxResults) {
    return {
      ...maxResults ? { max_results: maxResults } : {},
      ...this._queryParams
    };
  }
  async next(maxResults) {
    const queryParams = this.getNextQueryParams(maxResults);
    const result = await this.makeRequest(queryParams);
    return this.makeNewInstanceFromResult(result, queryParams);
  }
  async fetchNext(maxResults) {
    const queryParams = this.getNextQueryParams(maxResults);
    const result = await this.makeRequest(queryParams);
    await this.refreshInstanceFromResult(result, true);
    return this;
  }
  async fetchLast(count = Infinity) {
    let queryParams = this.getNextQueryParams(this._maxResultsWhenFetchLast);
    let resultCount = 0;
    while (resultCount < count && this._isRateLimitOk) {
      const response = await this.makeRequest(queryParams);
      await this.refreshInstanceFromResult(response, true);
      resultCount += this.getPageLengthFromRequest(response);
      if (this.isFetchLastOver(response)) {
        break;
      }
      queryParams = this.getNextQueryParams(this._maxResultsWhenFetchLast);
    }
    return this;
  }
  get rateLimit() {
    var _a;
    return { ...(_a = this._rateLimit) !== null && _a !== void 0 ? _a : {} };
  }
  get data() {
    return this._realData;
  }
  get done() {
    return !this.canFetchNextPage(this._realData);
  }
  *[Symbol.iterator]() {
    yield* this.getItemArray();
  }
  async *[Symbol.asyncIterator]() {
    yield* this.getItemArray();
    let paginator = this;
    let canFetchNextPage = this.canFetchNextPage(this._realData);
    while (canFetchNextPage && this._isRateLimitOk && paginator.getItemArray().length > 0) {
      const next = await paginator.next(this._maxResultsWhenFetchLast);
      this.refreshInstanceFromResult({ data: next._realData, headers: {}, rateLimit: next._rateLimit }, true);
      canFetchNextPage = this.canFetchNextPage(next._realData);
      const items = next.getItemArray();
      yield* items;
      paginator = next;
    }
  }
  async *fetchAndIterate() {
    for (const item of this.getItemArray()) {
      yield [item, this];
    }
    let paginator = this;
    let canFetchNextPage = this.canFetchNextPage(this._realData);
    while (canFetchNextPage && this._isRateLimitOk && paginator.getItemArray().length > 0) {
      const next = await paginator.next(this._maxResultsWhenFetchLast);
      this.refreshInstanceFromResult({ data: next._realData, headers: {}, rateLimit: next._rateLimit }, true);
      canFetchNextPage = this.canFetchNextPage(next._realData);
      for (const item of next.getItemArray()) {
        yield [item, next];
      }
      this._rateLimit = next._rateLimit;
      paginator = next;
    }
  }
};
var PreviousableTwitterPaginator = class extends TwitterPaginator {
  async previous(maxResults) {
    const queryParams = this.getPreviousQueryParams(maxResults);
    const result = await this.makeRequest(queryParams);
    return this.makeNewInstanceFromResult(result, queryParams);
  }
  async fetchPrevious(maxResults) {
    const queryParams = this.getPreviousQueryParams(maxResults);
    const result = await this.makeRequest(queryParams);
    await this.refreshInstanceFromResult(result, false);
    return this;
  }
};
var TwitterPaginator_default = TwitterPaginator;

// node_modules/twitter-api-v2/dist/esm/paginators/paginator.v1.js
var CursoredV1Paginator = class extends TwitterPaginator_default {
  getNextQueryParams(maxResults) {
    var _a;
    return {
      ...this._queryParams,
      cursor: (_a = this._realData.next_cursor_str) !== null && _a !== void 0 ? _a : this._realData.next_cursor,
      ...maxResults ? { count: maxResults } : {}
    };
  }
  isFetchLastOver(result) {
    return !this.canFetchNextPage(result.data);
  }
  canFetchNextPage(result) {
    return !this.isNextCursorInvalid(result.next_cursor) || !this.isNextCursorInvalid(result.next_cursor_str);
  }
  isNextCursorInvalid(value) {
    return value === void 0 || value === 0 || value === -1 || value === "0" || value === "-1";
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/dm.paginator.v1.js
var DmEventsV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "direct_messages/events/list.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.events.push(...result.events);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.events.length;
  }
  getItemArray() {
    return this.events;
  }
  get events() {
    return this._realData.events;
  }
};
var WelcomeDmV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "direct_messages/welcome_messages/list.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.welcome_messages.push(...result.welcome_messages);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.welcome_messages.length;
  }
  getItemArray() {
    return this.welcomeMessages;
  }
  get welcomeMessages() {
    return this._realData.welcome_messages;
  }
};

// node_modules/twitter-api-v2/dist/esm/types/v1/tweet.v1.types.js
var EUploadMimeType;
(function(EUploadMimeType2) {
  EUploadMimeType2["Jpeg"] = "image/jpeg";
  EUploadMimeType2["Mp4"] = "video/mp4";
  EUploadMimeType2["Mov"] = "video/quicktime";
  EUploadMimeType2["Gif"] = "image/gif";
  EUploadMimeType2["Png"] = "image/png";
  EUploadMimeType2["Srt"] = "text/plain";
  EUploadMimeType2["Webp"] = "image/webp";
})(EUploadMimeType || (EUploadMimeType = {}));

// node_modules/twitter-api-v2/dist/esm/types/v1/dm.v1.types.js
var EDirectMessageEventTypeV1;
(function(EDirectMessageEventTypeV12) {
  EDirectMessageEventTypeV12["Create"] = "message_create";
  EDirectMessageEventTypeV12["WelcomeCreate"] = "welcome_message";
})(EDirectMessageEventTypeV1 || (EDirectMessageEventTypeV1 = {}));

// node_modules/twitter-api-v2/dist/esm/types/errors.types.js
var ETwitterApiError;
(function(ETwitterApiError2) {
  ETwitterApiError2["Request"] = "request";
  ETwitterApiError2["PartialResponse"] = "partial-response";
  ETwitterApiError2["Response"] = "response";
})(ETwitterApiError || (ETwitterApiError = {}));
var ApiError = class extends Error {
  constructor() {
    super(...arguments);
    this.error = true;
  }
};
var ApiRequestError = class extends ApiError {
  constructor(message, options) {
    super(message);
    this.type = ETwitterApiError.Request;
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, "_options", { value: options });
  }
  get request() {
    return this._options.request;
  }
  get requestError() {
    return this._options.requestError;
  }
  toJSON() {
    return {
      type: this.type,
      error: this.requestError
    };
  }
};
var ApiPartialResponseError = class extends ApiError {
  constructor(message, options) {
    super(message);
    this.type = ETwitterApiError.PartialResponse;
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, "_options", { value: options });
  }
  get request() {
    return this._options.request;
  }
  get response() {
    return this._options.response;
  }
  get responseError() {
    return this._options.responseError;
  }
  get rawContent() {
    return this._options.rawContent;
  }
  toJSON() {
    return {
      type: this.type,
      error: this.responseError
    };
  }
};
var ApiResponseError = class extends ApiError {
  constructor(message, options) {
    super(message);
    this.type = ETwitterApiError.Response;
    Error.captureStackTrace(this, this.constructor);
    Object.defineProperty(this, "_options", { value: options });
    this.code = options.code;
    this.headers = options.headers;
    this.rateLimit = options.rateLimit;
    if (options.data && typeof options.data === "object" && "error" in options.data && !options.data.errors) {
      const data = { ...options.data };
      data.errors = [{
        code: EApiV1ErrorCode.InternalError,
        message: data.error
      }];
      this.data = data;
    } else {
      this.data = options.data;
    }
  }
  get request() {
    return this._options.request;
  }
  get response() {
    return this._options.response;
  }
  hasErrorCode(...codes) {
    const errors = this.errors;
    if (!(errors === null || errors === void 0 ? void 0 : errors.length)) {
      return false;
    }
    if ("code" in errors[0]) {
      const v1errors = errors;
      return v1errors.some((error) => codes.includes(error.code));
    }
    const v2error = this.data;
    return codes.includes(v2error.type);
  }
  get errors() {
    var _a;
    return (_a = this.data) === null || _a === void 0 ? void 0 : _a.errors;
  }
  get rateLimitError() {
    return this.code === 420 || this.code === 429;
  }
  get isAuthError() {
    if (this.code === 401) {
      return true;
    }
    return this.hasErrorCode(EApiV1ErrorCode.AuthTimestampInvalid, EApiV1ErrorCode.AuthenticationFail, EApiV1ErrorCode.BadAuthenticationData, EApiV1ErrorCode.InvalidOrExpiredToken);
  }
  toJSON() {
    return {
      type: this.type,
      code: this.code,
      error: this.data,
      rateLimit: this.rateLimit,
      headers: this.headers
    };
  }
};
var EApiV1ErrorCode;
(function(EApiV1ErrorCode2) {
  EApiV1ErrorCode2[EApiV1ErrorCode2["InvalidCoordinates"] = 3] = "InvalidCoordinates";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoLocationFound"] = 13] = "NoLocationFound";
  EApiV1ErrorCode2[EApiV1ErrorCode2["AuthenticationFail"] = 32] = "AuthenticationFail";
  EApiV1ErrorCode2[EApiV1ErrorCode2["InvalidOrExpiredToken"] = 89] = "InvalidOrExpiredToken";
  EApiV1ErrorCode2[EApiV1ErrorCode2["UnableToVerifyCredentials"] = 99] = "UnableToVerifyCredentials";
  EApiV1ErrorCode2[EApiV1ErrorCode2["AuthTimestampInvalid"] = 135] = "AuthTimestampInvalid";
  EApiV1ErrorCode2[EApiV1ErrorCode2["BadAuthenticationData"] = 215] = "BadAuthenticationData";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoUserMatch"] = 17] = "NoUserMatch";
  EApiV1ErrorCode2[EApiV1ErrorCode2["UserNotFound"] = 50] = "UserNotFound";
  EApiV1ErrorCode2[EApiV1ErrorCode2["ResourceNotFound"] = 34] = "ResourceNotFound";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetNotFound"] = 144] = "TweetNotFound";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetNotVisible"] = 179] = "TweetNotVisible";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NotAllowedResource"] = 220] = "NotAllowedResource";
  EApiV1ErrorCode2[EApiV1ErrorCode2["MediaIdNotFound"] = 325] = "MediaIdNotFound";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetNoLongerAvailable"] = 421] = "TweetNoLongerAvailable";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetViolatedRules"] = 422] = "TweetViolatedRules";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TargetUserSuspended"] = 63] = "TargetUserSuspended";
  EApiV1ErrorCode2[EApiV1ErrorCode2["YouAreSuspended"] = 64] = "YouAreSuspended";
  EApiV1ErrorCode2[EApiV1ErrorCode2["AccountUpdateFailed"] = 120] = "AccountUpdateFailed";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoSelfSpamReport"] = 36] = "NoSelfSpamReport";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoSelfMute"] = 271] = "NoSelfMute";
  EApiV1ErrorCode2[EApiV1ErrorCode2["AccountLocked"] = 326] = "AccountLocked";
  EApiV1ErrorCode2[EApiV1ErrorCode2["RateLimitExceeded"] = 88] = "RateLimitExceeded";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoDMRightForApp"] = 93] = "NoDMRightForApp";
  EApiV1ErrorCode2[EApiV1ErrorCode2["OverCapacity"] = 130] = "OverCapacity";
  EApiV1ErrorCode2[EApiV1ErrorCode2["InternalError"] = 131] = "InternalError";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TooManyFollowings"] = 161] = "TooManyFollowings";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetLimitExceeded"] = 185] = "TweetLimitExceeded";
  EApiV1ErrorCode2[EApiV1ErrorCode2["DuplicatedTweet"] = 187] = "DuplicatedTweet";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TooManySpamReports"] = 205] = "TooManySpamReports";
  EApiV1ErrorCode2[EApiV1ErrorCode2["RequestLooksLikeSpam"] = 226] = "RequestLooksLikeSpam";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoWriteRightForApp"] = 261] = "NoWriteRightForApp";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetActionsDisabled"] = 425] = "TweetActionsDisabled";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetRepliesRestricted"] = 433] = "TweetRepliesRestricted";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NamedParameterMissing"] = 38] = "NamedParameterMissing";
  EApiV1ErrorCode2[EApiV1ErrorCode2["InvalidAttachmentUrl"] = 44] = "InvalidAttachmentUrl";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetTextTooLong"] = 186] = "TweetTextTooLong";
  EApiV1ErrorCode2[EApiV1ErrorCode2["MissingUrlParameter"] = 195] = "MissingUrlParameter";
  EApiV1ErrorCode2[EApiV1ErrorCode2["NoMultipleGifs"] = 323] = "NoMultipleGifs";
  EApiV1ErrorCode2[EApiV1ErrorCode2["InvalidMediaIds"] = 324] = "InvalidMediaIds";
  EApiV1ErrorCode2[EApiV1ErrorCode2["InvalidUrl"] = 407] = "InvalidUrl";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TooManyTweetAttachments"] = 386] = "TooManyTweetAttachments";
  EApiV1ErrorCode2[EApiV1ErrorCode2["StatusAlreadyFavorited"] = 139] = "StatusAlreadyFavorited";
  EApiV1ErrorCode2[EApiV1ErrorCode2["FollowRequestAlreadySent"] = 160] = "FollowRequestAlreadySent";
  EApiV1ErrorCode2[EApiV1ErrorCode2["CannotUnmuteANonMutedAccount"] = 272] = "CannotUnmuteANonMutedAccount";
  EApiV1ErrorCode2[EApiV1ErrorCode2["TweetAlreadyRetweeted"] = 327] = "TweetAlreadyRetweeted";
  EApiV1ErrorCode2[EApiV1ErrorCode2["ReplyToDeletedTweet"] = 385] = "ReplyToDeletedTweet";
  EApiV1ErrorCode2[EApiV1ErrorCode2["DMReceiverNotFollowingYou"] = 150] = "DMReceiverNotFollowingYou";
  EApiV1ErrorCode2[EApiV1ErrorCode2["UnableToSendDM"] = 151] = "UnableToSendDM";
  EApiV1ErrorCode2[EApiV1ErrorCode2["MustAllowDMFromAnyone"] = 214] = "MustAllowDMFromAnyone";
  EApiV1ErrorCode2[EApiV1ErrorCode2["CannotSendDMToThisUser"] = 349] = "CannotSendDMToThisUser";
  EApiV1ErrorCode2[EApiV1ErrorCode2["DMTextTooLong"] = 354] = "DMTextTooLong";
  EApiV1ErrorCode2[EApiV1ErrorCode2["SubscriptionAlreadyExists"] = 355] = "SubscriptionAlreadyExists";
  EApiV1ErrorCode2[EApiV1ErrorCode2["CallbackUrlNotApproved"] = 415] = "CallbackUrlNotApproved";
  EApiV1ErrorCode2[EApiV1ErrorCode2["SuspendedApplication"] = 416] = "SuspendedApplication";
  EApiV1ErrorCode2[EApiV1ErrorCode2["OobOauthIsNotAllowed"] = 417] = "OobOauthIsNotAllowed";
})(EApiV1ErrorCode || (EApiV1ErrorCode = {}));
var EApiV2ErrorCode;
(function(EApiV2ErrorCode2) {
  EApiV2ErrorCode2["InvalidRequest"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#invalid-request";
  EApiV2ErrorCode2["ClientForbidden"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#client-forbidden";
  EApiV2ErrorCode2["UnsupportedAuthentication"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#unsupported-authentication";
  EApiV2ErrorCode2["InvalidRules"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#invalid-rules";
  EApiV2ErrorCode2["TooManyRules"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#rule-cap";
  EApiV2ErrorCode2["DuplicatedRules"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#duplicate-rules";
  EApiV2ErrorCode2["RateLimitExceeded"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#usage-capped";
  EApiV2ErrorCode2["ConnectionError"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#streaming-connection";
  EApiV2ErrorCode2["ClientDisconnected"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#client-disconnected";
  EApiV2ErrorCode2["TwitterDisconnectedYou"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#operational-disconnect";
  EApiV2ErrorCode2["ResourceNotFound"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#resource-not-found";
  EApiV2ErrorCode2["ResourceUnauthorized"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#not-authorized-for-resource";
  EApiV2ErrorCode2["DisallowedResource"] = "https://developer.x.com/en/support/x-api/error-troubleshooting#disallowed-resource";
})(EApiV2ErrorCode || (EApiV2ErrorCode = {}));

// node_modules/twitter-api-v2/dist/esm/types/client.types.js
var ETwitterStreamEvent;
(function(ETwitterStreamEvent2) {
  ETwitterStreamEvent2["Connected"] = "connected";
  ETwitterStreamEvent2["ConnectError"] = "connect error";
  ETwitterStreamEvent2["ConnectionError"] = "connection error";
  ETwitterStreamEvent2["ConnectionClosed"] = "connection closed";
  ETwitterStreamEvent2["ConnectionLost"] = "connection lost";
  ETwitterStreamEvent2["ReconnectAttempt"] = "reconnect attempt";
  ETwitterStreamEvent2["Reconnected"] = "reconnected";
  ETwitterStreamEvent2["ReconnectError"] = "reconnect error";
  ETwitterStreamEvent2["ReconnectLimitExceeded"] = "reconnect limit exceeded";
  ETwitterStreamEvent2["DataKeepAlive"] = "data keep-alive";
  ETwitterStreamEvent2["Data"] = "data event content";
  ETwitterStreamEvent2["DataError"] = "data twitter error";
  ETwitterStreamEvent2["TweetParseError"] = "data tweet parse error";
  ETwitterStreamEvent2["Error"] = "stream error";
})(ETwitterStreamEvent || (ETwitterStreamEvent = {}));

// node_modules/twitter-api-v2/dist/esm/types/plugins/client.plugins.types.js
var TwitterApiPluginResponseOverride = class {
  constructor(value) {
    this.value = value;
  }
};

// node_modules/twitter-api-v2/dist/esm/v1/client.v1.write.js
var fs2 = __toModule(require("fs"));

// node_modules/twitter-api-v2/dist/esm/settings.js
var TwitterApiV2Settings = {
  debug: false,
  deprecationWarnings: true,
  logger: { log: console.log.bind(console) }
};

// node_modules/twitter-api-v2/dist/esm/helpers.js
function sharedPromise(getter) {
  const sharedPromise2 = {
    value: void 0,
    promise: getter().then((val) => {
      sharedPromise2.value = val;
      return val;
    })
  };
  return sharedPromise2;
}
function arrayWrap(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}
function trimUndefinedProperties(object) {
  for (const parameter in object) {
    if (object[parameter] === void 0)
      delete object[parameter];
  }
}
function isTweetStreamV2ErrorPayload(payload) {
  return typeof payload === "object" && "errors" in payload && !("data" in payload);
}
function hasMultipleItems(item) {
  if (Array.isArray(item) && item.length > 1) {
    return true;
  }
  return item.toString().includes(",");
}
var deprecationWarningsCache = new Set();
function safeDeprecationWarning(message) {
  if (typeof console === "undefined" || !console.warn || !TwitterApiV2Settings.deprecationWarnings) {
    return;
  }
  const hash = `${message.instance}-${message.method}-${message.problem}`;
  if (deprecationWarningsCache.has(hash)) {
    return;
  }
  const formattedMsg = `[twitter-api-v2] Deprecation warning: In ${message.instance}.${message.method}() call, ${message.problem}.
${message.resolution}.`;
  console.warn(formattedMsg);
  console.warn("To disable this message, import variable TwitterApiV2Settings from twitter-api-v2 and set TwitterApiV2Settings.deprecationWarnings to false.");
  deprecationWarningsCache.add(hash);
}

// node_modules/twitter-api-v2/dist/esm/stream/TweetStream.js
var import_events4 = __toModule(require("events"));

// node_modules/twitter-api-v2/dist/esm/client-mixins/request-handler.helper.js
var import_https = __toModule(require("https"));
var zlib = __toModule(require("zlib"));
var import_events = __toModule(require("events"));
var RequestHandlerHelper = class {
  constructor(requestData) {
    this.requestData = requestData;
    this.requestErrorHandled = false;
    this.responseData = [];
  }
  get hrefPathname() {
    const url = this.requestData.url;
    return url.hostname + url.pathname;
  }
  isCompressionDisabled() {
    return !this.requestData.compression || this.requestData.compression === "identity";
  }
  isFormEncodedEndpoint() {
    return this.requestData.url.href.startsWith("https://api.x.com/oauth/");
  }
  createRequestError(error) {
    if (TwitterApiV2Settings.debug) {
      TwitterApiV2Settings.logger.log("Request error:", error);
    }
    return new ApiRequestError("Request failed.", {
      request: this.req,
      error
    });
  }
  createPartialResponseError(error, abortClose) {
    const res = this.res;
    let message = `Request failed with partial response with HTTP code ${res.statusCode}`;
    if (abortClose) {
      message += " (connection abruptly closed)";
    } else {
      message += " (parse error)";
    }
    return new ApiPartialResponseError(message, {
      request: this.req,
      response: this.res,
      responseError: error,
      rawContent: Buffer.concat(this.responseData).toString()
    });
  }
  formatV1Errors(errors) {
    return errors.map(({ code, message }) => `${message} (Twitter code ${code})`).join(", ");
  }
  formatV2Error(error) {
    return `${error.title}: ${error.detail} (see ${error.type})`;
  }
  createResponseError({ res, data, rateLimit, code }) {
    var _a;
    if (TwitterApiV2Settings.debug) {
      TwitterApiV2Settings.logger.log(`Request failed with code ${code}, data:`, data);
      TwitterApiV2Settings.logger.log("Response headers:", res.headers);
    }
    let errorString = `Request failed with code ${code}`;
    if ((_a = data === null || data === void 0 ? void 0 : data.errors) === null || _a === void 0 ? void 0 : _a.length) {
      const errors = data.errors;
      if ("code" in errors[0]) {
        errorString += " - " + this.formatV1Errors(errors);
      } else {
        errorString += " - " + this.formatV2Error(data);
      }
    }
    return new ApiResponseError(errorString, {
      code,
      data,
      headers: res.headers,
      request: this.req,
      response: res,
      rateLimit
    });
  }
  getResponseDataStream(res) {
    if (this.isCompressionDisabled()) {
      return res;
    }
    const contentEncoding = (res.headers["content-encoding"] || "identity").trim().toLowerCase();
    if (contentEncoding === "br") {
      const brotli = zlib.createBrotliDecompress({
        flush: zlib.constants.BROTLI_OPERATION_FLUSH,
        finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
      });
      res.pipe(brotli);
      return brotli;
    }
    if (contentEncoding === "gzip") {
      const gunzip = zlib.createGunzip({
        flush: zlib.constants.Z_SYNC_FLUSH,
        finishFlush: zlib.constants.Z_SYNC_FLUSH
      });
      res.pipe(gunzip);
      return gunzip;
    }
    if (contentEncoding === "deflate") {
      const inflate = zlib.createInflate({
        flush: zlib.constants.Z_SYNC_FLUSH,
        finishFlush: zlib.constants.Z_SYNC_FLUSH
      });
      res.pipe(inflate);
      return inflate;
    }
    return res;
  }
  detectResponseType(res) {
    var _a, _b;
    if (((_a = res.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.includes("application/json")) || ((_b = res.headers["content-type"]) === null || _b === void 0 ? void 0 : _b.includes("application/problem+json"))) {
      return "json";
    } else if (this.isFormEncodedEndpoint()) {
      return "url";
    }
    return "text";
  }
  getParsedResponse(res) {
    const data = this.responseData;
    const mode = this.requestData.forceParseMode || this.detectResponseType(res);
    if (mode === "buffer") {
      return Buffer.concat(data);
    } else if (mode === "text") {
      return Buffer.concat(data).toString();
    } else if (mode === "json") {
      const asText = Buffer.concat(data).toString();
      return asText.length ? JSON.parse(asText) : void 0;
    } else if (mode === "url") {
      const asText = Buffer.concat(data).toString();
      const formEntries = {};
      for (const [item, value] of new URLSearchParams(asText)) {
        formEntries[item] = value;
      }
      return formEntries;
    } else {
      return void 0;
    }
  }
  getRateLimitFromResponse(res) {
    let rateLimit = void 0;
    if (res.headers["x-rate-limit-limit"]) {
      rateLimit = {
        limit: Number(res.headers["x-rate-limit-limit"]),
        remaining: Number(res.headers["x-rate-limit-remaining"]),
        reset: Number(res.headers["x-rate-limit-reset"])
      };
      if (res.headers["x-app-limit-24hour-limit"]) {
        rateLimit.day = {
          limit: Number(res.headers["x-app-limit-24hour-limit"]),
          remaining: Number(res.headers["x-app-limit-24hour-remaining"]),
          reset: Number(res.headers["x-app-limit-24hour-reset"])
        };
      }
      if (this.requestData.rateLimitSaver) {
        this.requestData.rateLimitSaver(rateLimit);
      }
    }
    return rateLimit;
  }
  onSocketEventHandler(reject, cleanupListener, socket) {
    const onClose = this.onSocketCloseHandler.bind(this, reject);
    socket.on("close", onClose);
    cleanupListener.on("complete", () => socket.off("close", onClose));
  }
  onSocketCloseHandler(reject) {
    this.req.removeAllListeners("timeout");
    const res = this.res;
    if (res) {
      return;
    }
    if (!this.requestErrorHandled) {
      return reject(this.createRequestError(new Error("Socket closed without any information.")));
    }
  }
  requestErrorHandler(reject, requestError) {
    var _a, _b;
    (_b = (_a = this.requestData).requestEventDebugHandler) === null || _b === void 0 ? void 0 : _b.call(_a, "request-error", { requestError });
    this.requestErrorHandled = true;
    reject(this.createRequestError(requestError));
  }
  timeoutErrorHandler() {
    this.requestErrorHandled = true;
    this.req.destroy(new Error("Request timeout."));
  }
  classicResponseHandler(resolve, reject, res) {
    this.res = res;
    const dataStream = this.getResponseDataStream(res);
    dataStream.on("data", (chunk) => this.responseData.push(chunk));
    dataStream.on("end", this.onResponseEndHandler.bind(this, resolve, reject));
    dataStream.on("close", this.onResponseCloseHandler.bind(this, resolve, reject));
    if (this.requestData.requestEventDebugHandler) {
      this.requestData.requestEventDebugHandler("response", { res });
      res.on("aborted", (error) => this.requestData.requestEventDebugHandler("response-aborted", { error }));
      res.on("error", (error) => this.requestData.requestEventDebugHandler("response-error", { error }));
      res.on("close", () => this.requestData.requestEventDebugHandler("response-close", { data: this.responseData }));
      res.on("end", () => this.requestData.requestEventDebugHandler("response-end"));
    }
  }
  onResponseEndHandler(resolve, reject) {
    const rateLimit = this.getRateLimitFromResponse(this.res);
    let data;
    try {
      data = this.getParsedResponse(this.res);
    } catch (e) {
      reject(this.createPartialResponseError(e, false));
      return;
    }
    const code = this.res.statusCode;
    if (code >= 400) {
      reject(this.createResponseError({ data, res: this.res, rateLimit, code }));
      return;
    }
    if (TwitterApiV2Settings.debug) {
      TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]: Request succeeds with code ${this.res.statusCode}`);
      TwitterApiV2Settings.logger.log("Response body:", data);
    }
    resolve({
      data,
      headers: this.res.headers,
      rateLimit
    });
  }
  onResponseCloseHandler(resolve, reject) {
    const res = this.res;
    if (res.aborted) {
      try {
        this.getParsedResponse(this.res);
        return this.onResponseEndHandler(resolve, reject);
      } catch (e) {
        return reject(this.createPartialResponseError(e, true));
      }
    }
    if (!res.complete) {
      return reject(this.createPartialResponseError(new Error("Response has been interrupted before response could be parsed."), true));
    }
  }
  streamResponseHandler(resolve, reject, res) {
    const code = res.statusCode;
    if (code < 400) {
      if (TwitterApiV2Settings.debug) {
        TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]: Request succeeds with code ${res.statusCode} (starting stream)`);
      }
      const dataStream = this.getResponseDataStream(res);
      resolve({ req: this.req, res: dataStream, originalResponse: res, requestData: this.requestData });
    } else {
      this.classicResponseHandler(() => void 0, reject, res);
    }
  }
  debugRequest() {
    const url = this.requestData.url;
    TwitterApiV2Settings.logger.log(`[${this.requestData.options.method} ${this.hrefPathname}]`, this.requestData.options);
    if (url.search) {
      TwitterApiV2Settings.logger.log("Request parameters:", [...url.searchParams.entries()].map(([key, value]) => `${key}: ${value}`));
    }
    if (this.requestData.body) {
      TwitterApiV2Settings.logger.log("Request body:", this.requestData.body);
    }
  }
  buildRequest() {
    var _a;
    const url = this.requestData.url;
    const auth = url.username ? `${url.username}:${url.password}` : void 0;
    const headers = (_a = this.requestData.options.headers) !== null && _a !== void 0 ? _a : {};
    if (this.requestData.compression === true || this.requestData.compression === "brotli") {
      headers["accept-encoding"] = "br;q=1.0, gzip;q=0.8, deflate;q=0.5, *;q=0.1";
    } else if (this.requestData.compression === "gzip") {
      headers["accept-encoding"] = "gzip;q=1, deflate;q=0.5, *;q=0.1";
    } else if (this.requestData.compression === "deflate") {
      headers["accept-encoding"] = "deflate;q=1, *;q=0.1";
    }
    if (TwitterApiV2Settings.debug) {
      this.debugRequest();
    }
    this.req = (0, import_https.request)({
      ...this.requestData.options,
      host: url.hostname,
      port: url.port || void 0,
      path: url.pathname + url.search,
      protocol: url.protocol,
      auth,
      headers
    });
  }
  registerRequestEventDebugHandlers(req) {
    req.on("close", () => this.requestData.requestEventDebugHandler("close"));
    req.on("abort", () => this.requestData.requestEventDebugHandler("abort"));
    req.on("socket", (socket) => {
      this.requestData.requestEventDebugHandler("socket", { socket });
      socket.on("error", (error) => this.requestData.requestEventDebugHandler("socket-error", { socket, error }));
      socket.on("connect", () => this.requestData.requestEventDebugHandler("socket-connect", { socket }));
      socket.on("close", (withError) => this.requestData.requestEventDebugHandler("socket-close", { socket, withError }));
      socket.on("end", () => this.requestData.requestEventDebugHandler("socket-end", { socket }));
      socket.on("lookup", (...data) => this.requestData.requestEventDebugHandler("socket-lookup", { socket, data }));
      socket.on("timeout", () => this.requestData.requestEventDebugHandler("socket-timeout", { socket }));
    });
  }
  makeRequest() {
    this.buildRequest();
    return new Promise((_resolve, _reject) => {
      const resolve = (value) => {
        cleanupListener.emit("complete");
        _resolve(value);
      };
      const reject = (value) => {
        cleanupListener.emit("complete");
        _reject(value);
      };
      const cleanupListener = new import_events.EventEmitter();
      const req = this.req;
      req.on("error", this.requestErrorHandler.bind(this, reject));
      req.on("socket", this.onSocketEventHandler.bind(this, reject, cleanupListener));
      req.on("response", this.classicResponseHandler.bind(this, resolve, reject));
      if (this.requestData.options.timeout) {
        req.on("timeout", this.timeoutErrorHandler.bind(this));
      }
      if (this.requestData.requestEventDebugHandler) {
        this.registerRequestEventDebugHandlers(req);
      }
      if (this.requestData.body) {
        req.write(this.requestData.body);
      }
      req.end();
    });
  }
  async makeRequestAsStream() {
    const { req, res, requestData, originalResponse } = await this.makeRequestAndResolveWhenReady();
    return new TweetStream_default(requestData, { req, res, originalResponse });
  }
  makeRequestAndResolveWhenReady() {
    this.buildRequest();
    return new Promise((resolve, reject) => {
      const req = this.req;
      req.on("error", this.requestErrorHandler.bind(this, reject));
      req.on("response", this.streamResponseHandler.bind(this, resolve, reject));
      if (this.requestData.body) {
        req.write(this.requestData.body);
      }
      req.end();
    });
  }
};
var request_handler_helper_default = RequestHandlerHelper;

// node_modules/twitter-api-v2/dist/esm/stream/TweetStreamEventCombiner.js
var import_events2 = __toModule(require("events"));
var TweetStreamEventCombiner = class extends import_events2.EventEmitter {
  constructor(stream) {
    super();
    this.stream = stream;
    this.stack = [];
    this.onStreamData = this.onStreamData.bind(this);
    this.onStreamError = this.onStreamError.bind(this);
    this.onceNewEvent = this.once.bind(this, "event");
    stream.on(ETwitterStreamEvent.Data, this.onStreamData);
    stream.on(ETwitterStreamEvent.ConnectionError, this.onStreamError);
    stream.on(ETwitterStreamEvent.TweetParseError, this.onStreamError);
    stream.on(ETwitterStreamEvent.ConnectionClosed, this.onStreamError);
  }
  nextEvent() {
    return new Promise(this.onceNewEvent);
  }
  hasStack() {
    return this.stack.length > 0;
  }
  popStack() {
    const stack = this.stack;
    this.stack = [];
    return stack;
  }
  destroy() {
    this.removeAllListeners();
    this.stream.off(ETwitterStreamEvent.Data, this.onStreamData);
    this.stream.off(ETwitterStreamEvent.ConnectionError, this.onStreamError);
    this.stream.off(ETwitterStreamEvent.TweetParseError, this.onStreamError);
    this.stream.off(ETwitterStreamEvent.ConnectionClosed, this.onStreamError);
  }
  emitEvent(type, payload) {
    this.emit("event", { type, payload });
  }
  onStreamError(payload) {
    this.emitEvent("error", payload);
  }
  onStreamData(payload) {
    this.stack.push(payload);
    this.emitEvent("data", payload);
  }
};
var TweetStreamEventCombiner_default = TweetStreamEventCombiner;

// node_modules/twitter-api-v2/dist/esm/stream/TweetStreamParser.js
var import_events3 = __toModule(require("events"));
var TweetStreamParser = class extends import_events3.EventEmitter {
  constructor() {
    super(...arguments);
    this.currentMessage = "";
  }
  push(chunk) {
    this.currentMessage += chunk;
    chunk = this.currentMessage;
    const size = chunk.length;
    let start = 0;
    let offset = 0;
    while (offset < size) {
      if (chunk.slice(offset, offset + 2) === "\r\n") {
        const piece = chunk.slice(start, offset);
        start = offset += 2;
        if (!piece.length) {
          continue;
        }
        try {
          const payload = JSON.parse(piece);
          if (payload) {
            this.emit(EStreamParserEvent.ParsedData, payload);
            continue;
          }
        } catch (error) {
          this.emit(EStreamParserEvent.ParseError, error);
        }
      }
      offset++;
    }
    this.currentMessage = chunk.slice(start, size);
  }
  reset() {
    this.currentMessage = "";
  }
};
var EStreamParserEvent;
(function(EStreamParserEvent2) {
  EStreamParserEvent2["ParsedData"] = "parsed data";
  EStreamParserEvent2["ParseError"] = "parse error";
})(EStreamParserEvent || (EStreamParserEvent = {}));

// node_modules/twitter-api-v2/dist/esm/stream/TweetStream.js
var basicRetriesAttempt = [5, 15, 30, 60, 90, 120, 180, 300, 600, 900];
var basicReconnectRetry = (tryOccurrence) => tryOccurrence > basicRetriesAttempt.length ? 901e3 : basicRetriesAttempt[tryOccurrence - 1] * 1e3;
var TweetStream = class extends import_events4.EventEmitter {
  constructor(requestData, connection) {
    super();
    this.requestData = requestData;
    this.autoReconnect = false;
    this.autoReconnectRetries = 5;
    this.keepAliveTimeoutMs = 1e3 * 120;
    this.nextRetryTimeout = basicReconnectRetry;
    this.parser = new TweetStreamParser();
    this.connectionProcessRunning = false;
    this.onKeepAliveTimeout = this.onKeepAliveTimeout.bind(this);
    this.initEventsFromParser();
    if (connection) {
      this.req = connection.req;
      this.res = connection.res;
      this.originalResponse = connection.originalResponse;
      this.initEventsFromRequest();
    }
  }
  on(event, handler) {
    return super.on(event, handler);
  }
  initEventsFromRequest() {
    if (!this.req || !this.res) {
      throw new Error("TweetStream error: You cannot init TweetStream without a request and response object.");
    }
    const errorHandler = (err) => {
      this.emit(ETwitterStreamEvent.ConnectionError, err);
      this.emit(ETwitterStreamEvent.Error, {
        type: ETwitterStreamEvent.ConnectionError,
        error: err,
        message: "Connection lost or closed by Twitter."
      });
      this.onConnectionError();
    };
    this.req.on("error", errorHandler);
    this.res.on("error", errorHandler);
    this.res.on("close", () => errorHandler(new Error("Connection closed by Twitter.")));
    this.res.on("data", (chunk) => {
      this.resetKeepAliveTimeout();
      if (chunk.toString() === "\r\n") {
        return this.emit(ETwitterStreamEvent.DataKeepAlive);
      }
      this.parser.push(chunk.toString());
    });
    this.resetKeepAliveTimeout();
  }
  initEventsFromParser() {
    const payloadIsError = this.requestData.payloadIsError;
    this.parser.on(EStreamParserEvent.ParsedData, (eventData) => {
      if (payloadIsError && payloadIsError(eventData)) {
        this.emit(ETwitterStreamEvent.DataError, eventData);
        this.emit(ETwitterStreamEvent.Error, {
          type: ETwitterStreamEvent.DataError,
          error: eventData,
          message: "Twitter sent a payload that is detected as an error payload."
        });
      } else {
        this.emit(ETwitterStreamEvent.Data, eventData);
      }
    });
    this.parser.on(EStreamParserEvent.ParseError, (error) => {
      this.emit(ETwitterStreamEvent.TweetParseError, error);
      this.emit(ETwitterStreamEvent.Error, {
        type: ETwitterStreamEvent.TweetParseError,
        error,
        message: "Failed to parse stream data."
      });
    });
  }
  resetKeepAliveTimeout() {
    this.unbindKeepAliveTimeout();
    if (this.keepAliveTimeoutMs !== Infinity) {
      this.keepAliveTimeout = setTimeout(this.onKeepAliveTimeout, this.keepAliveTimeoutMs);
    }
  }
  onKeepAliveTimeout() {
    this.emit(ETwitterStreamEvent.ConnectionLost);
    this.onConnectionError();
  }
  unbindTimeouts() {
    this.unbindRetryTimeout();
    this.unbindKeepAliveTimeout();
  }
  unbindKeepAliveTimeout() {
    if (this.keepAliveTimeout) {
      clearTimeout(this.keepAliveTimeout);
      this.keepAliveTimeout = void 0;
    }
  }
  unbindRetryTimeout() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = void 0;
    }
  }
  closeWithoutEmit() {
    this.unbindTimeouts();
    if (this.res) {
      this.res.removeAllListeners();
      this.res.destroy();
    }
    if (this.req) {
      this.req.removeAllListeners();
      this.req.destroy();
    }
  }
  close() {
    this.emit(ETwitterStreamEvent.ConnectionClosed);
    this.closeWithoutEmit();
  }
  destroy() {
    this.removeAllListeners();
    this.close();
  }
  async clone() {
    const newRequest = new request_handler_helper_default(this.requestData);
    const newStream = await newRequest.makeRequestAsStream();
    const listenerNames = this.eventNames();
    for (const listener of listenerNames) {
      const callbacks = this.listeners(listener);
      for (const callback of callbacks) {
        newStream.on(listener, callback);
      }
    }
    return newStream;
  }
  async connect(options = {}) {
    if (typeof options.autoReconnect !== "undefined") {
      this.autoReconnect = options.autoReconnect;
    }
    if (typeof options.autoReconnectRetries !== "undefined") {
      this.autoReconnectRetries = options.autoReconnectRetries === "unlimited" ? Infinity : options.autoReconnectRetries;
    }
    if (typeof options.keepAliveTimeout !== "undefined") {
      this.keepAliveTimeoutMs = options.keepAliveTimeout === "disable" ? Infinity : options.keepAliveTimeout;
    }
    if (typeof options.nextRetryTimeout !== "undefined") {
      this.nextRetryTimeout = options.nextRetryTimeout;
    }
    this.unbindTimeouts();
    try {
      await this.reconnect();
    } catch (e) {
      this.emit(ETwitterStreamEvent.ConnectError, 0);
      this.emit(ETwitterStreamEvent.Error, {
        type: ETwitterStreamEvent.ConnectError,
        error: e,
        message: "Connect error - Initial connection just failed."
      });
      if (this.autoReconnect) {
        this.makeAutoReconnectRetry(0, e);
      } else {
        throw e;
      }
    }
    return this;
  }
  async reconnect() {
    if (this.connectionProcessRunning) {
      throw new Error("Connection process is already running.");
    }
    this.connectionProcessRunning = true;
    try {
      let initialConnection = true;
      if (this.req) {
        initialConnection = false;
        this.closeWithoutEmit();
      }
      const { req, res, originalResponse } = await new request_handler_helper_default(this.requestData).makeRequestAndResolveWhenReady();
      this.req = req;
      this.res = res;
      this.originalResponse = originalResponse;
      this.emit(initialConnection ? ETwitterStreamEvent.Connected : ETwitterStreamEvent.Reconnected);
      this.parser.reset();
      this.initEventsFromRequest();
    } finally {
      this.connectionProcessRunning = false;
    }
  }
  async onConnectionError(retryOccurrence = 0) {
    this.unbindTimeouts();
    this.closeWithoutEmit();
    if (!this.autoReconnect) {
      this.emit(ETwitterStreamEvent.ConnectionClosed);
      return;
    }
    if (retryOccurrence >= this.autoReconnectRetries) {
      this.emit(ETwitterStreamEvent.ReconnectLimitExceeded);
      this.emit(ETwitterStreamEvent.ConnectionClosed);
      return;
    }
    try {
      this.emit(ETwitterStreamEvent.ReconnectAttempt, retryOccurrence);
      await this.reconnect();
    } catch (e) {
      this.emit(ETwitterStreamEvent.ReconnectError, retryOccurrence);
      this.emit(ETwitterStreamEvent.Error, {
        type: ETwitterStreamEvent.ReconnectError,
        error: e,
        message: `Reconnect error - ${retryOccurrence + 1} attempts made yet.`
      });
      this.makeAutoReconnectRetry(retryOccurrence, e);
    }
  }
  makeAutoReconnectRetry(retryOccurrence, error) {
    const nextRetry = this.nextRetryTimeout(retryOccurrence + 1, error);
    this.retryTimeout = setTimeout(() => {
      this.onConnectionError(retryOccurrence + 1);
    }, nextRetry);
  }
  async *[Symbol.asyncIterator]() {
    const eventCombiner = new TweetStreamEventCombiner_default(this);
    try {
      while (true) {
        if (!this.req || this.req.aborted) {
          throw new Error("Connection closed");
        }
        if (eventCombiner.hasStack()) {
          yield* eventCombiner.popStack();
        }
        const { type, payload } = await eventCombiner.nextEvent();
        if (type === "error") {
          throw payload;
        }
      }
    } finally {
      eventCombiner.destroy();
    }
  }
};
var TweetStream_default = TweetStream;

// node_modules/twitter-api-v2/dist/esm/plugins/helpers.js
function hasRequestErrorPlugins(client) {
  var _a;
  if (!((_a = client.clientSettings.plugins) === null || _a === void 0 ? void 0 : _a.length)) {
    return false;
  }
  for (const plugin of client.clientSettings.plugins) {
    if (plugin.onRequestError || plugin.onResponseError) {
      return true;
    }
  }
  return false;
}
async function applyResponseHooks(requestParams, computedParams, requestOptions, error) {
  let override;
  if (error instanceof ApiRequestError || error instanceof ApiPartialResponseError) {
    override = await this.applyPluginMethod("onRequestError", {
      client: this,
      url: this.getUrlObjectFromUrlString(requestParams.url),
      params: requestParams,
      computedParams,
      requestOptions,
      error
    });
  } else if (error instanceof ApiResponseError) {
    override = await this.applyPluginMethod("onResponseError", {
      client: this,
      url: this.getUrlObjectFromUrlString(requestParams.url),
      params: requestParams,
      computedParams,
      requestOptions,
      error
    });
  }
  if (override && override instanceof TwitterApiPluginResponseOverride) {
    return override.value;
  }
  return Promise.reject(error);
}

// node_modules/twitter-api-v2/dist/esm/client-mixins/oauth1.helper.js
var crypto2 = __toModule(require("crypto"));
var OAuth1Helper = class {
  constructor(options) {
    this.nonceLength = 32;
    this.consumerKeys = options.consumerKeys;
  }
  static percentEncode(str) {
    return encodeURIComponent(str).replace(/!/g, "%21").replace(/\*/g, "%2A").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
  }
  hash(base, key) {
    return crypto2.createHmac("sha1", key).update(base).digest("base64");
  }
  authorize(request3, accessTokens = {}) {
    const oauthInfo = {
      oauth_consumer_key: this.consumerKeys.key,
      oauth_nonce: this.getNonce(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: this.getTimestamp(),
      oauth_version: "1.0"
    };
    if (accessTokens.key !== void 0) {
      oauthInfo.oauth_token = accessTokens.key;
    }
    if (!request3.data) {
      request3.data = {};
    }
    oauthInfo.oauth_signature = this.getSignature(request3, accessTokens.secret, oauthInfo);
    return oauthInfo;
  }
  toHeader(oauthInfo) {
    const sorted = sortObject(oauthInfo);
    let header_value = "OAuth ";
    for (const element of sorted) {
      if (element.key.indexOf("oauth_") !== 0) {
        continue;
      }
      header_value += OAuth1Helper.percentEncode(element.key) + '="' + OAuth1Helper.percentEncode(element.value) + '",';
    }
    return {
      Authorization: header_value.slice(0, header_value.length - 1)
    };
  }
  getNonce() {
    const wordCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < this.nonceLength; i++) {
      result += wordCharacters[Math.trunc(Math.random() * wordCharacters.length)];
    }
    return result;
  }
  getTimestamp() {
    return Math.trunc(new Date().getTime() / 1e3);
  }
  getSignature(request3, tokenSecret, oauthInfo) {
    return this.hash(this.getBaseString(request3, oauthInfo), this.getSigningKey(tokenSecret));
  }
  getSigningKey(tokenSecret) {
    return OAuth1Helper.percentEncode(this.consumerKeys.secret) + "&" + OAuth1Helper.percentEncode(tokenSecret || "");
  }
  getBaseString(request3, oauthInfo) {
    return request3.method.toUpperCase() + "&" + OAuth1Helper.percentEncode(this.getBaseUrl(request3.url)) + "&" + OAuth1Helper.percentEncode(this.getParameterString(request3, oauthInfo));
  }
  getParameterString(request3, oauthInfo) {
    const baseStringData = sortObject(percentEncodeData(mergeObject(oauthInfo, mergeObject(request3.data, deParamUrl(request3.url)))));
    let dataStr = "";
    for (const { key, value } of baseStringData) {
      if (value && Array.isArray(value)) {
        value.sort();
        let valString = "";
        value.forEach((item, i) => {
          valString += key + "=" + item;
          if (i < value.length) {
            valString += "&";
          }
        });
        dataStr += valString;
      } else {
        dataStr += key + "=" + value + "&";
      }
    }
    return dataStr.slice(0, dataStr.length - 1);
  }
  getBaseUrl(url) {
    return url.split("?")[0];
  }
};
var oauth1_helper_default = OAuth1Helper;
function mergeObject(obj1, obj2) {
  return {
    ...obj1 || {},
    ...obj2 || {}
  };
}
function sortObject(data) {
  return Object.keys(data).sort().map((key) => ({ key, value: data[key] }));
}
function deParam(string) {
  const split = string.split("&");
  const data = {};
  for (const coupleKeyValue of split) {
    const [key, value = ""] = coupleKeyValue.split("=");
    if (data[key]) {
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(decodeURIComponent(value));
    } else {
      data[key] = decodeURIComponent(value);
    }
  }
  return data;
}
function deParamUrl(url) {
  const tmp = url.split("?");
  if (tmp.length === 1)
    return {};
  return deParam(tmp[1]);
}
function percentEncodeData(data) {
  const result = {};
  for (const key in data) {
    let value = data[key];
    if (value && Array.isArray(value)) {
      value = value.map((v) => OAuth1Helper.percentEncode(v));
    } else {
      value = OAuth1Helper.percentEncode(value);
    }
    result[OAuth1Helper.percentEncode(key)] = value;
  }
  return result;
}

// node_modules/twitter-api-v2/dist/esm/client-mixins/form-data.helper.js
var FormDataHelper = class {
  constructor() {
    this._boundary = "";
    this._chunks = [];
  }
  bodyAppend(...values) {
    const allAsBuffer = values.map((val) => val instanceof Buffer ? val : Buffer.from(val));
    this._chunks.push(...allAsBuffer);
  }
  append(field, value, contentType) {
    const convertedValue = value instanceof Buffer ? value : value.toString();
    const header = this.getMultipartHeader(field, convertedValue, contentType);
    this.bodyAppend(header, convertedValue, FormDataHelper.LINE_BREAK);
  }
  getHeaders() {
    return {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
  }
  getLength() {
    return this._chunks.reduce((acc, cur) => acc + cur.length, this.getMultipartFooter().length);
  }
  getBuffer() {
    const allChunks = [...this._chunks, this.getMultipartFooter()];
    const totalBuffer = Buffer.alloc(this.getLength());
    let i = 0;
    for (const chunk of allChunks) {
      for (let j = 0; j < chunk.length; i++, j++) {
        totalBuffer[i] = chunk[j];
      }
    }
    return totalBuffer;
  }
  getBoundary() {
    if (!this._boundary) {
      this.generateBoundary();
    }
    return this._boundary;
  }
  generateBoundary() {
    let boundary = "--------------------------";
    for (let i = 0; i < 24; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16);
    }
    this._boundary = boundary;
  }
  getMultipartHeader(field, value, contentType) {
    if (!contentType) {
      contentType = value instanceof Buffer ? FormDataHelper.DEFAULT_CONTENT_TYPE : "";
    }
    const headers = {
      "Content-Disposition": ["form-data", `name="${field}"`],
      "Content-Type": contentType
    };
    let contents = "";
    for (const [prop, header] of Object.entries(headers)) {
      if (!header.length) {
        continue;
      }
      contents += prop + ": " + arrayWrap(header).join("; ") + FormDataHelper.LINE_BREAK;
    }
    return "--" + this.getBoundary() + FormDataHelper.LINE_BREAK + contents + FormDataHelper.LINE_BREAK;
  }
  getMultipartFooter() {
    if (this._footerChunk) {
      return this._footerChunk;
    }
    return this._footerChunk = Buffer.from("--" + this.getBoundary() + "--" + FormDataHelper.LINE_BREAK);
  }
};
FormDataHelper.LINE_BREAK = "\r\n";
FormDataHelper.DEFAULT_CONTENT_TYPE = "application/octet-stream";

// node_modules/twitter-api-v2/dist/esm/client-mixins/request-param.helper.js
var RequestParamHelpers = class {
  static formatQueryToString(query) {
    const formattedQuery = {};
    for (const prop in query) {
      if (typeof query[prop] === "string") {
        formattedQuery[prop] = query[prop];
      } else if (typeof query[prop] !== "undefined") {
        formattedQuery[prop] = String(query[prop]);
      }
    }
    return formattedQuery;
  }
  static autoDetectBodyType(url) {
    if (url.pathname.startsWith("/2/") || url.pathname.startsWith("/labs/2/")) {
      if (url.password.startsWith("/2/oauth2")) {
        return "url";
      }
      return "json";
    }
    if (url.hostname === "upload.x.com") {
      if (url.pathname === "/1.1/media/upload.json") {
        return "form-data";
      }
      return "json";
    }
    const endpoint = url.pathname.split("/1.1/", 2)[1];
    if (this.JSON_1_1_ENDPOINTS.has(endpoint)) {
      return "json";
    }
    return "url";
  }
  static addQueryParamsToUrl(url, query) {
    const queryEntries = Object.entries(query);
    if (queryEntries.length) {
      let search = "";
      for (const [key, value] of queryEntries) {
        search += (search.length ? "&" : "?") + `${oauth1_helper_default.percentEncode(key)}=${oauth1_helper_default.percentEncode(value)}`;
      }
      url.search = search;
    }
  }
  static constructBodyParams(body, headers, mode) {
    if (body instanceof Buffer) {
      return body;
    }
    if (mode === "json") {
      if (!headers["content-type"]) {
        headers["content-type"] = "application/json;charset=UTF-8";
      }
      return JSON.stringify(body);
    } else if (mode === "url") {
      if (!headers["content-type"]) {
        headers["content-type"] = "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (Object.keys(body).length) {
        return new URLSearchParams(body).toString().replace(/\*/g, "%2A");
      }
      return "";
    } else if (mode === "raw") {
      throw new Error("You can only use raw body mode with Buffers. To give a string, use Buffer.from(str).");
    } else {
      const form = new FormDataHelper();
      for (const parameter in body) {
        form.append(parameter, body[parameter]);
      }
      if (!headers["content-type"]) {
        const formHeaders = form.getHeaders();
        headers["content-type"] = formHeaders["content-type"];
      }
      return form.getBuffer();
    }
  }
  static setBodyLengthHeader(options, body) {
    var _a;
    options.headers = (_a = options.headers) !== null && _a !== void 0 ? _a : {};
    if (typeof body === "string") {
      options.headers["content-length"] = Buffer.byteLength(body);
    } else {
      options.headers["content-length"] = body.length;
    }
  }
  static isOAuthSerializable(item) {
    return !(item instanceof Buffer);
  }
  static mergeQueryAndBodyForOAuth(query, body) {
    const parameters = {};
    for (const prop in query) {
      parameters[prop] = query[prop];
    }
    if (this.isOAuthSerializable(body)) {
      for (const prop in body) {
        const bodyProp = body[prop];
        if (this.isOAuthSerializable(bodyProp)) {
          parameters[prop] = typeof bodyProp === "object" && bodyProp !== null && "toString" in bodyProp ? bodyProp.toString() : bodyProp;
        }
      }
    }
    return parameters;
  }
  static moveUrlQueryParamsIntoObject(url, query) {
    for (const [param, value] of url.searchParams) {
      query[param] = value;
    }
    url.search = "";
    return url;
  }
  static applyRequestParametersToUrl(url, parameters) {
    url.pathname = url.pathname.replace(/:([A-Z_-]+)/ig, (fullMatch, paramName) => {
      if (parameters[paramName] !== void 0) {
        return String(parameters[paramName]);
      }
      return fullMatch;
    });
    return url;
  }
};
RequestParamHelpers.JSON_1_1_ENDPOINTS = new Set([
  "direct_messages/events/new.json",
  "direct_messages/welcome_messages/new.json",
  "direct_messages/welcome_messages/rules/new.json",
  "media/metadata/create.json",
  "collections/entries/curate.json"
]);
var request_param_helper_default = RequestParamHelpers;

// node_modules/twitter-api-v2/dist/esm/client-mixins/oauth2.helper.js
var crypto3 = __toModule(require("crypto"));
var OAuth2Helper = class {
  static getCodeVerifier() {
    return this.generateRandomString(128);
  }
  static getCodeChallengeFromVerifier(verifier) {
    return this.escapeBase64Url(crypto3.createHash("sha256").update(verifier).digest("base64"));
  }
  static getAuthHeader(clientId, clientSecret) {
    const key = encodeURIComponent(clientId) + ":" + encodeURIComponent(clientSecret);
    return Buffer.from(key).toString("base64");
  }
  static generateRandomString(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (let i = 0; i < length; i++) {
      text += possible[Math.floor(Math.random() * possible.length)];
    }
    return text;
  }
  static escapeBase64Url(string) {
    return string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }
};

// node_modules/twitter-api-v2/dist/esm/client-mixins/request-maker.mixin.js
var ClientRequestMaker = class {
  constructor(settings) {
    this.rateLimits = {};
    this.clientSettings = {};
    if (settings) {
      this.clientSettings = settings;
    }
  }
  getRateLimits() {
    return this.rateLimits;
  }
  saveRateLimit(originalUrl, rateLimit) {
    this.rateLimits[originalUrl] = rateLimit;
  }
  async send(requestParams) {
    var _a, _b, _c, _d, _e;
    if ((_a = this.clientSettings.plugins) === null || _a === void 0 ? void 0 : _a.length) {
      const possibleResponse = await this.applyPreRequestConfigHooks(requestParams);
      if (possibleResponse) {
        return possibleResponse;
      }
    }
    const args = this.getHttpRequestArgs(requestParams);
    const options = {
      method: args.method,
      headers: args.headers,
      timeout: requestParams.timeout,
      agent: this.clientSettings.httpAgent
    };
    const enableRateLimitSave = requestParams.enableRateLimitSave !== false;
    if (args.body) {
      request_param_helper_default.setBodyLengthHeader(options, args.body);
    }
    if ((_b = this.clientSettings.plugins) === null || _b === void 0 ? void 0 : _b.length) {
      await this.applyPreRequestHooks(requestParams, args, options);
    }
    let request3 = new request_handler_helper_default({
      url: args.url,
      options,
      body: args.body,
      rateLimitSaver: enableRateLimitSave ? this.saveRateLimit.bind(this, args.rawUrl) : void 0,
      requestEventDebugHandler: requestParams.requestEventDebugHandler,
      compression: (_d = (_c = requestParams.compression) !== null && _c !== void 0 ? _c : this.clientSettings.compression) !== null && _d !== void 0 ? _d : true,
      forceParseMode: requestParams.forceParseMode
    }).makeRequest();
    if (hasRequestErrorPlugins(this)) {
      request3 = this.applyResponseErrorHooks(requestParams, args, options, request3);
    }
    const response = await request3;
    if ((_e = this.clientSettings.plugins) === null || _e === void 0 ? void 0 : _e.length) {
      const responseOverride = await this.applyPostRequestHooks(requestParams, args, options, response);
      if (responseOverride) {
        return responseOverride.value;
      }
    }
    return response;
  }
  sendStream(requestParams) {
    var _a, _b;
    if (this.clientSettings.plugins) {
      this.applyPreStreamRequestConfigHooks(requestParams);
    }
    const args = this.getHttpRequestArgs(requestParams);
    const options = {
      method: args.method,
      headers: args.headers,
      agent: this.clientSettings.httpAgent
    };
    const enableRateLimitSave = requestParams.enableRateLimitSave !== false;
    const enableAutoConnect = requestParams.autoConnect !== false;
    if (args.body) {
      request_param_helper_default.setBodyLengthHeader(options, args.body);
    }
    const requestData = {
      url: args.url,
      options,
      body: args.body,
      rateLimitSaver: enableRateLimitSave ? this.saveRateLimit.bind(this, args.rawUrl) : void 0,
      payloadIsError: requestParams.payloadIsError,
      compression: (_b = (_a = requestParams.compression) !== null && _a !== void 0 ? _a : this.clientSettings.compression) !== null && _b !== void 0 ? _b : true
    };
    const stream = new TweetStream_default(requestData);
    if (!enableAutoConnect) {
      return stream;
    }
    return stream.connect();
  }
  initializeToken(token) {
    if (typeof token === "string") {
      this.bearerToken = token;
    } else if (typeof token === "object" && "appKey" in token) {
      this.consumerToken = token.appKey;
      this.consumerSecret = token.appSecret;
      if (token.accessToken && token.accessSecret) {
        this.accessToken = token.accessToken;
        this.accessSecret = token.accessSecret;
      }
      this._oauth = this.buildOAuth();
    } else if (typeof token === "object" && "username" in token) {
      const key = encodeURIComponent(token.username) + ":" + encodeURIComponent(token.password);
      this.basicToken = Buffer.from(key).toString("base64");
    } else if (typeof token === "object" && "clientId" in token) {
      this.clientId = token.clientId;
      this.clientSecret = token.clientSecret;
    }
  }
  getActiveTokens() {
    if (this.bearerToken) {
      return {
        type: "oauth2",
        bearerToken: this.bearerToken
      };
    } else if (this.basicToken) {
      return {
        type: "basic",
        token: this.basicToken
      };
    } else if (this.consumerSecret && this._oauth) {
      return {
        type: "oauth-1.0a",
        appKey: this.consumerToken,
        appSecret: this.consumerSecret,
        accessToken: this.accessToken,
        accessSecret: this.accessSecret
      };
    } else if (this.clientId) {
      return {
        type: "oauth2-user",
        clientId: this.clientId
      };
    }
    return { type: "none" };
  }
  buildOAuth() {
    if (!this.consumerSecret || !this.consumerToken)
      throw new Error("Invalid consumer tokens");
    return new oauth1_helper_default({
      consumerKeys: { key: this.consumerToken, secret: this.consumerSecret }
    });
  }
  getOAuthAccessTokens() {
    if (!this.accessSecret || !this.accessToken)
      return;
    return {
      key: this.accessToken,
      secret: this.accessSecret
    };
  }
  getPlugins() {
    var _a;
    return (_a = this.clientSettings.plugins) !== null && _a !== void 0 ? _a : [];
  }
  hasPlugins() {
    var _a;
    return !!((_a = this.clientSettings.plugins) === null || _a === void 0 ? void 0 : _a.length);
  }
  async applyPluginMethod(method, args) {
    var _a;
    let returnValue;
    for (const plugin of this.getPlugins()) {
      const value = await ((_a = plugin[method]) === null || _a === void 0 ? void 0 : _a.call(plugin, args));
      if (value && value instanceof TwitterApiPluginResponseOverride) {
        returnValue = value;
      }
    }
    return returnValue;
  }
  writeAuthHeaders({ headers, bodyInSignature, url, method, query, body }) {
    headers = { ...headers };
    if (this.bearerToken) {
      headers.Authorization = "Bearer " + this.bearerToken;
    } else if (this.basicToken) {
      headers.Authorization = "Basic " + this.basicToken;
    } else if (this.clientId && this.clientSecret) {
      headers.Authorization = "Basic " + OAuth2Helper.getAuthHeader(this.clientId, this.clientSecret);
    } else if (this.consumerSecret && this._oauth) {
      const data = bodyInSignature ? request_param_helper_default.mergeQueryAndBodyForOAuth(query, body) : query;
      const auth = this._oauth.authorize({
        url: url.toString(),
        method,
        data
      }, this.getOAuthAccessTokens());
      headers = { ...headers, ...this._oauth.toHeader(auth) };
    }
    return headers;
  }
  getUrlObjectFromUrlString(url) {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return new URL(url);
  }
  getHttpRequestArgs({ url: stringUrl, method, query: rawQuery = {}, body: rawBody = {}, headers, forceBodyMode, enableAuth, params }) {
    let body = void 0;
    method = method.toUpperCase();
    headers = headers !== null && headers !== void 0 ? headers : {};
    if (!headers["x-user-agent"]) {
      headers["x-user-agent"] = "Node.twitter-api-v2";
    }
    const url = this.getUrlObjectFromUrlString(stringUrl);
    const rawUrl = url.origin + url.pathname;
    if (params) {
      request_param_helper_default.applyRequestParametersToUrl(url, params);
    }
    const query = request_param_helper_default.formatQueryToString(rawQuery);
    request_param_helper_default.moveUrlQueryParamsIntoObject(url, query);
    if (!(rawBody instanceof Buffer)) {
      trimUndefinedProperties(rawBody);
    }
    const bodyType = forceBodyMode !== null && forceBodyMode !== void 0 ? forceBodyMode : request_param_helper_default.autoDetectBodyType(url);
    if (enableAuth !== false) {
      const bodyInSignature = ClientRequestMaker.BODY_METHODS.has(method) && bodyType === "url";
      headers = this.writeAuthHeaders({ headers, bodyInSignature, method, query, url, body: rawBody });
    }
    if (ClientRequestMaker.BODY_METHODS.has(method)) {
      body = request_param_helper_default.constructBodyParams(rawBody, headers, bodyType) || void 0;
    }
    request_param_helper_default.addQueryParamsToUrl(url, query);
    return {
      rawUrl,
      url,
      method,
      headers,
      body
    };
  }
  async applyPreRequestConfigHooks(requestParams) {
    var _a;
    const url = this.getUrlObjectFromUrlString(requestParams.url);
    for (const plugin of this.getPlugins()) {
      const result = await ((_a = plugin.onBeforeRequestConfig) === null || _a === void 0 ? void 0 : _a.call(plugin, {
        client: this,
        url,
        params: requestParams
      }));
      if (result) {
        return result;
      }
    }
  }
  applyPreStreamRequestConfigHooks(requestParams) {
    var _a;
    const url = this.getUrlObjectFromUrlString(requestParams.url);
    for (const plugin of this.getPlugins()) {
      (_a = plugin.onBeforeStreamRequestConfig) === null || _a === void 0 ? void 0 : _a.call(plugin, {
        client: this,
        url,
        params: requestParams
      });
    }
  }
  async applyPreRequestHooks(requestParams, computedParams, requestOptions) {
    await this.applyPluginMethod("onBeforeRequest", {
      client: this,
      url: this.getUrlObjectFromUrlString(requestParams.url),
      params: requestParams,
      computedParams,
      requestOptions
    });
  }
  async applyPostRequestHooks(requestParams, computedParams, requestOptions, response) {
    return await this.applyPluginMethod("onAfterRequest", {
      client: this,
      url: this.getUrlObjectFromUrlString(requestParams.url),
      params: requestParams,
      computedParams,
      requestOptions,
      response
    });
  }
  applyResponseErrorHooks(requestParams, computedParams, requestOptions, promise) {
    return promise.catch(applyResponseHooks.bind(this, requestParams, computedParams, requestOptions));
  }
};
ClientRequestMaker.BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

// node_modules/twitter-api-v2/dist/esm/client.base.js
var TwitterApiBase = class {
  constructor(token, settings = {}) {
    this._currentUser = null;
    this._currentUserV2 = null;
    if (token instanceof TwitterApiBase) {
      this._requestMaker = token._requestMaker;
    } else {
      this._requestMaker = new ClientRequestMaker(settings);
      this._requestMaker.initializeToken(token);
    }
  }
  setPrefix(prefix) {
    this._prefix = prefix;
  }
  cloneWithPrefix(prefix) {
    const clone = this.constructor(this);
    clone.setPrefix(prefix);
    return clone;
  }
  getActiveTokens() {
    return this._requestMaker.getActiveTokens();
  }
  getPlugins() {
    return this._requestMaker.getPlugins();
  }
  getPluginOfType(type) {
    return this.getPlugins().find((plugin) => plugin instanceof type);
  }
  hasHitRateLimit(endpoint) {
    var _a;
    if (this.isRateLimitStatusObsolete(endpoint)) {
      return false;
    }
    return ((_a = this.getLastRateLimitStatus(endpoint)) === null || _a === void 0 ? void 0 : _a.remaining) === 0;
  }
  isRateLimitStatusObsolete(endpoint) {
    const rateLimit = this.getLastRateLimitStatus(endpoint);
    if (rateLimit === void 0) {
      return true;
    }
    return rateLimit.reset * 1e3 < Date.now();
  }
  getLastRateLimitStatus(endpoint) {
    const endpointWithPrefix = endpoint.match(/^https?:\/\//) ? endpoint : this._prefix + endpoint;
    return this._requestMaker.getRateLimits()[endpointWithPrefix];
  }
  getCurrentUserObject(forceFetch = false) {
    if (!forceFetch && this._currentUser) {
      if (this._currentUser.value) {
        return Promise.resolve(this._currentUser.value);
      }
      return this._currentUser.promise;
    }
    this._currentUser = sharedPromise(() => this.get("account/verify_credentials.json", { tweet_mode: "extended" }, { prefix: API_V1_1_PREFIX }));
    return this._currentUser.promise;
  }
  getCurrentUserV2Object(forceFetch = false) {
    if (!forceFetch && this._currentUserV2) {
      if (this._currentUserV2.value) {
        return Promise.resolve(this._currentUserV2.value);
      }
      return this._currentUserV2.promise;
    }
    this._currentUserV2 = sharedPromise(() => this.get("users/me", void 0, { prefix: API_V2_PREFIX }));
    return this._currentUserV2.promise;
  }
  async get(url, query = {}, { fullResponse, prefix = this._prefix, ...rest } = {}) {
    if (prefix)
      url = prefix + url;
    const resp = await this._requestMaker.send({
      url,
      method: "GET",
      query,
      ...rest
    });
    return fullResponse ? resp : resp.data;
  }
  async delete(url, query = {}, { fullResponse, prefix = this._prefix, ...rest } = {}) {
    if (prefix)
      url = prefix + url;
    const resp = await this._requestMaker.send({
      url,
      method: "DELETE",
      query,
      ...rest
    });
    return fullResponse ? resp : resp.data;
  }
  async post(url, body, { fullResponse, prefix = this._prefix, ...rest } = {}) {
    if (prefix)
      url = prefix + url;
    const resp = await this._requestMaker.send({
      url,
      method: "POST",
      body,
      ...rest
    });
    return fullResponse ? resp : resp.data;
  }
  async put(url, body, { fullResponse, prefix = this._prefix, ...rest } = {}) {
    if (prefix)
      url = prefix + url;
    const resp = await this._requestMaker.send({
      url,
      method: "PUT",
      body,
      ...rest
    });
    return fullResponse ? resp : resp.data;
  }
  async patch(url, body, { fullResponse, prefix = this._prefix, ...rest } = {}) {
    if (prefix)
      url = prefix + url;
    const resp = await this._requestMaker.send({
      url,
      method: "PATCH",
      body,
      ...rest
    });
    return fullResponse ? resp : resp.data;
  }
  getStream(url, query, { prefix = this._prefix, ...rest } = {}) {
    return this._requestMaker.sendStream({
      url: prefix ? prefix + url : url,
      method: "GET",
      query,
      ...rest
    });
  }
  postStream(url, body, { prefix = this._prefix, ...rest } = {}) {
    return this._requestMaker.sendStream({
      url: prefix ? prefix + url : url,
      method: "POST",
      body,
      ...rest
    });
  }
};

// node_modules/twitter-api-v2/dist/esm/client.subclient.js
var TwitterApiSubClient = class extends TwitterApiBase {
  constructor(instance) {
    if (!(instance instanceof TwitterApiBase)) {
      throw new Error("You must instance SubTwitterApi instance from existing TwitterApi instance.");
    }
    super(instance);
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/tweet.paginator.v1.js
var TweetTimelineV1Paginator = class extends TwitterPaginator_default {
  constructor() {
    super(...arguments);
    this.hasFinishedFetch = false;
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.push(...result);
      this.hasFinishedFetch = result.length === 0;
    }
  }
  getNextQueryParams(maxResults) {
    const latestId = BigInt(this._realData[this._realData.length - 1].id_str);
    return {
      ...this.injectQueryParams(maxResults),
      max_id: (latestId - BigInt(1)).toString()
    };
  }
  getPageLengthFromRequest(result) {
    return result.data.length;
  }
  isFetchLastOver(result) {
    return !result.data.length;
  }
  canFetchNextPage(result) {
    return result.length > 0;
  }
  getItemArray() {
    return this.tweets;
  }
  get tweets() {
    return this._realData;
  }
  get done() {
    return super.done || this.hasFinishedFetch;
  }
};
var HomeTimelineV1Paginator = class extends TweetTimelineV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "statuses/home_timeline.json";
  }
};
var MentionTimelineV1Paginator = class extends TweetTimelineV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "statuses/mentions_timeline.json";
  }
};
var UserTimelineV1Paginator = class extends TweetTimelineV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "statuses/user_timeline.json";
  }
};
var ListTimelineV1Paginator = class extends TweetTimelineV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/statuses.json";
  }
};
var UserFavoritesV1Paginator = class extends TweetTimelineV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "favorites/list.json";
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/mutes.paginator.v1.js
var MuteUserListV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "mutes/users/list.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.users.push(...result.users);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.users.length;
  }
  getItemArray() {
    return this.users;
  }
  get users() {
    return this._realData.users;
  }
};
var MuteUserIdsV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "mutes/users/ids.json";
    this._maxResultsWhenFetchLast = 5e3;
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.ids.push(...result.ids);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.ids.length;
  }
  getItemArray() {
    return this.ids;
  }
  get ids() {
    return this._realData.ids;
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/followers.paginator.v1.js
var UserFollowerListV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "followers/list.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.users.push(...result.users);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.users.length;
  }
  getItemArray() {
    return this.users;
  }
  get users() {
    return this._realData.users;
  }
};
var UserFollowerIdsV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "followers/ids.json";
    this._maxResultsWhenFetchLast = 5e3;
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.ids.push(...result.ids);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.ids.length;
  }
  getItemArray() {
    return this.ids;
  }
  get ids() {
    return this._realData.ids;
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/friends.paginator.v1.js
var UserFriendListV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "friends/list.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.users.push(...result.users);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.users.length;
  }
  getItemArray() {
    return this.users;
  }
  get users() {
    return this._realData.users;
  }
};
var UserFollowersIdsV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "friends/ids.json";
    this._maxResultsWhenFetchLast = 5e3;
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.ids.push(...result.ids);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.ids.length;
  }
  getItemArray() {
    return this.ids;
  }
  get ids() {
    return this._realData.ids;
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/user.paginator.v1.js
var UserSearchV1Paginator = class extends TwitterPaginator_default {
  constructor() {
    super(...arguments);
    this._endpoint = "users/search.json";
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.push(...result);
    }
  }
  getNextQueryParams(maxResults) {
    var _a;
    const previousPage = Number((_a = this._queryParams.page) !== null && _a !== void 0 ? _a : "1");
    return {
      ...this._queryParams,
      page: previousPage + 1,
      ...maxResults ? { count: maxResults } : {}
    };
  }
  getPageLengthFromRequest(result) {
    return result.data.length;
  }
  isFetchLastOver(result) {
    return !result.data.length;
  }
  canFetchNextPage(result) {
    return result.length > 0;
  }
  getItemArray() {
    return this.users;
  }
  get users() {
    return this._realData;
  }
};
var FriendshipsIncomingV1Paginator = class extends CursoredV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "friendships/incoming.json";
    this._maxResultsWhenFetchLast = 5e3;
  }
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.ids.push(...result.ids);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.ids.length;
  }
  getItemArray() {
    return this.ids;
  }
  get ids() {
    return this._realData.ids;
  }
};
var FriendshipsOutgoingV1Paginator = class extends FriendshipsIncomingV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "friendships/outgoing.json";
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/list.paginator.v1.js
var ListListsV1Paginator = class extends CursoredV1Paginator {
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.lists.push(...result.lists);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.lists.length;
  }
  getItemArray() {
    return this.lists;
  }
  get lists() {
    return this._realData.lists;
  }
};
var ListMembershipsV1Paginator = class extends ListListsV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/memberships.json";
  }
};
var ListOwnershipsV1Paginator = class extends ListListsV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/ownerships.json";
  }
};
var ListSubscriptionsV1Paginator = class extends ListListsV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/subscriptions.json";
  }
};
var ListUsersV1Paginator = class extends CursoredV1Paginator {
  refreshInstanceFromResult(response, isNextPage) {
    const result = response.data;
    this._rateLimit = response.rateLimit;
    if (isNextPage) {
      this._realData.users.push(...result.users);
      this._realData.next_cursor = result.next_cursor;
    }
  }
  getPageLengthFromRequest(result) {
    return result.data.users.length;
  }
  getItemArray() {
    return this.users;
  }
  get users() {
    return this._realData.users;
  }
};
var ListMembersV1Paginator = class extends ListUsersV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/members.json";
  }
};
var ListSubscribersV1Paginator = class extends ListUsersV1Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/subscribers.json";
  }
};

// node_modules/twitter-api-v2/dist/esm/v1/client.v1.read.js
var TwitterApiv1ReadOnly = class extends TwitterApiSubClient {
  constructor() {
    super(...arguments);
    this._prefix = API_V1_1_PREFIX;
  }
  singleTweet(tweetId, options = {}) {
    return this.get("statuses/show.json", { tweet_mode: "extended", id: tweetId, ...options });
  }
  tweets(ids, options = {}) {
    return this.post("statuses/lookup.json", { tweet_mode: "extended", id: ids, ...options });
  }
  oembedTweet(tweetId, options = {}) {
    return this.get("oembed", {
      url: `https://x.com/i/statuses/${tweetId}`,
      ...options
    }, { prefix: "https://publish.x.com/" });
  }
  async homeTimeline(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("statuses/home_timeline.json", queryParams, { fullResponse: true });
    return new HomeTimelineV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async mentionTimeline(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("statuses/mentions_timeline.json", queryParams, { fullResponse: true });
    return new MentionTimelineV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userTimeline(userId, options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      user_id: userId,
      ...options
    };
    const initialRq = await this.get("statuses/user_timeline.json", queryParams, { fullResponse: true });
    return new UserTimelineV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userTimelineByUsername(username, options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      screen_name: username,
      ...options
    };
    const initialRq = await this.get("statuses/user_timeline.json", queryParams, { fullResponse: true });
    return new UserTimelineV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async favoriteTimeline(userId, options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      user_id: userId,
      ...options
    };
    const initialRq = await this.get("favorites/list.json", queryParams, { fullResponse: true });
    return new UserFavoritesV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async favoriteTimelineByUsername(username, options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      screen_name: username,
      ...options
    };
    const initialRq = await this.get("favorites/list.json", queryParams, { fullResponse: true });
    return new UserFavoritesV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  user(user) {
    return this.get("users/show.json", { tweet_mode: "extended", ...user });
  }
  users(query) {
    return this.get("users/lookup.json", { tweet_mode: "extended", ...query });
  }
  verifyCredentials(options = {}) {
    return this.get("account/verify_credentials.json", options);
  }
  async listMutedUsers(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("mutes/users/list.json", queryParams, { fullResponse: true });
    return new MuteUserListV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async listMutedUserIds(options = {}) {
    const queryParams = {
      stringify_ids: true,
      ...options
    };
    const initialRq = await this.get("mutes/users/ids.json", queryParams, { fullResponse: true });
    return new MuteUserIdsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userFriendList(options = {}) {
    const queryParams = {
      ...options
    };
    const initialRq = await this.get("friends/list.json", queryParams, { fullResponse: true });
    return new UserFriendListV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userFollowerList(options = {}) {
    const queryParams = {
      ...options
    };
    const initialRq = await this.get("followers/list.json", queryParams, { fullResponse: true });
    return new UserFollowerListV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userFollowerIds(options = {}) {
    const queryParams = {
      stringify_ids: true,
      ...options
    };
    const initialRq = await this.get("followers/ids.json", queryParams, { fullResponse: true });
    return new UserFollowerIdsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async userFollowingIds(options = {}) {
    const queryParams = {
      stringify_ids: true,
      ...options
    };
    const initialRq = await this.get("friends/ids.json", queryParams, { fullResponse: true });
    return new UserFollowersIdsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async searchUsers(query, options = {}) {
    const queryParams = {
      q: query,
      tweet_mode: "extended",
      page: 1,
      ...options
    };
    const initialRq = await this.get("users/search.json", queryParams, { fullResponse: true });
    return new UserSearchV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  friendship(sources) {
    return this.get("friendships/show.json", sources);
  }
  friendships(friendships) {
    return this.get("friendships/lookup.json", friendships);
  }
  friendshipsNoRetweets() {
    return this.get("friendships/no_retweets/ids.json", { stringify_ids: true });
  }
  async friendshipsIncoming(options = {}) {
    const queryParams = {
      stringify_ids: true,
      ...options
    };
    const initialRq = await this.get("friendships/incoming.json", queryParams, { fullResponse: true });
    return new FriendshipsIncomingV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async friendshipsOutgoing(options = {}) {
    const queryParams = {
      stringify_ids: true,
      ...options
    };
    const initialRq = await this.get("friendships/outgoing.json", queryParams, { fullResponse: true });
    return new FriendshipsOutgoingV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  accountSettings() {
    return this.get("account/settings.json");
  }
  userProfileBannerSizes(params) {
    return this.get("users/profile_banner.json", params);
  }
  list(options) {
    return this.get("lists/show.json", { tweet_mode: "extended", ...options });
  }
  lists(options = {}) {
    return this.get("lists/list.json", { tweet_mode: "extended", ...options });
  }
  async listMembers(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/members.json", queryParams, { fullResponse: true });
    return new ListMembersV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  listGetMember(options) {
    return this.get("lists/members/show.json", { tweet_mode: "extended", ...options });
  }
  async listMemberships(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/memberships.json", queryParams, { fullResponse: true });
    return new ListMembershipsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async listOwnerships(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/ownerships.json", queryParams, { fullResponse: true });
    return new ListOwnershipsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async listStatuses(options) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/statuses.json", queryParams, { fullResponse: true });
    return new ListTimelineV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async listSubscribers(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/subscribers.json", queryParams, { fullResponse: true });
    return new ListSubscribersV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  listGetSubscriber(options) {
    return this.get("lists/subscribers/show.json", { tweet_mode: "extended", ...options });
  }
  async listSubscriptions(options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      ...options
    };
    const initialRq = await this.get("lists/subscriptions.json", queryParams, { fullResponse: true });
    return new ListSubscriptionsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  mediaInfo(mediaId) {
    return this.get("media/upload.json", {
      command: "STATUS",
      media_id: mediaId
    }, { prefix: API_V1_1_UPLOAD_PREFIX });
  }
  filterStream({ autoConnect, ...params } = {}) {
    const parameters = {};
    for (const [key, value] of Object.entries(params)) {
      if (key === "follow" || key === "track") {
        parameters[key] = value.toString();
      } else if (key === "locations") {
        const locations = value;
        parameters.locations = arrayWrap(locations).map((loc) => `${loc.lng},${loc.lat}`).join(",");
      } else {
        parameters[key] = value;
      }
    }
    const streamClient = this.stream;
    return streamClient.postStream("statuses/filter.json", parameters, { autoConnect });
  }
  sampleStream({ autoConnect, ...params } = {}) {
    const streamClient = this.stream;
    return streamClient.getStream("statuses/sample.json", params, { autoConnect });
  }
  get stream() {
    const copiedClient = new client_v1_default(this);
    copiedClient.setPrefix(API_V1_1_STREAM_PREFIX);
    return copiedClient;
  }
  trendsByPlace(woeId, options = {}) {
    return this.get("trends/place.json", { id: woeId, ...options });
  }
  trendsAvailable() {
    return this.get("trends/available.json");
  }
  trendsClosest(lat, long) {
    return this.get("trends/closest.json", { lat, long });
  }
  geoPlace(placeId) {
    return this.get("geo/id/:place_id.json", void 0, { params: { place_id: placeId } });
  }
  geoSearch(options) {
    return this.get("geo/search.json", options);
  }
  geoReverseGeoCode(options) {
    return this.get("geo/reverse_geocode.json", options);
  }
  rateLimitStatuses(...resources) {
    return this.get("application/rate_limit_status.json", { resources });
  }
  supportedLanguages() {
    return this.get("help/languages.json");
  }
};

// node_modules/twitter-api-v2/dist/esm/v1/media-helpers.v1.js
var fs = __toModule(require("fs"));
async function readFileIntoBuffer(file) {
  const handle = await getFileHandle(file);
  if (typeof handle === "number") {
    return new Promise((resolve, reject) => {
      fs.readFile(handle, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else if (handle instanceof Buffer) {
    return handle;
  } else {
    return handle.readFile();
  }
}
function getFileHandle(file) {
  if (typeof file === "string") {
    return fs.promises.open(file, "r");
  } else if (typeof file === "number") {
    return file;
  } else if (typeof file === "object" && !(file instanceof Buffer)) {
    return file;
  } else if (!(file instanceof Buffer)) {
    throw new Error("Given file is not valid, please check its type.");
  } else {
    return file;
  }
}
async function getFileSizeFromFileHandle(fileHandle) {
  if (typeof fileHandle === "number") {
    const stats = await new Promise((resolve, reject) => {
      fs.fstat(fileHandle, (err, stats2) => {
        if (err)
          reject(err);
        resolve(stats2);
      });
    });
    return stats.size;
  } else if (fileHandle instanceof Buffer) {
    return fileHandle.length;
  } else {
    return (await fileHandle.stat()).size;
  }
}
function getMimeType(file, type, mimeType) {
  if (typeof mimeType === "string") {
    return mimeType;
  } else if (typeof file === "string" && !type) {
    return getMimeByName(file);
  } else if (typeof type === "string") {
    return getMimeByType(type);
  }
  throw new Error("You must specify type if file is a file handle or Buffer.");
}
function getMimeByName(name) {
  if (name.endsWith(".jpeg") || name.endsWith(".jpg"))
    return EUploadMimeType.Jpeg;
  if (name.endsWith(".png"))
    return EUploadMimeType.Png;
  if (name.endsWith(".webp"))
    return EUploadMimeType.Webp;
  if (name.endsWith(".gif"))
    return EUploadMimeType.Gif;
  if (name.endsWith(".mpeg4") || name.endsWith(".mp4"))
    return EUploadMimeType.Mp4;
  if (name.endsWith(".mov") || name.endsWith(".mov"))
    return EUploadMimeType.Mov;
  if (name.endsWith(".srt"))
    return EUploadMimeType.Srt;
  safeDeprecationWarning({
    instance: "TwitterApiv1ReadWrite",
    method: "uploadMedia",
    problem: "options.mimeType is missing and filename couldn't help to resolve MIME type, so it will fallback to image/jpeg",
    resolution: "If you except to give filenames without extensions, please specify explicitlty the MIME type using options.mimeType"
  });
  return EUploadMimeType.Jpeg;
}
function getMimeByType(type) {
  safeDeprecationWarning({
    instance: "TwitterApiv1ReadWrite",
    method: "uploadMedia",
    problem: "you're using options.type",
    resolution: "Remove options.type argument and migrate to options.mimeType which takes the real MIME type. If you're using type=longmp4, add options.longVideo alongside of mimeType=EUploadMimeType.Mp4"
  });
  if (type === "gif")
    return EUploadMimeType.Gif;
  if (type === "jpg")
    return EUploadMimeType.Jpeg;
  if (type === "png")
    return EUploadMimeType.Png;
  if (type === "webp")
    return EUploadMimeType.Webp;
  if (type === "srt")
    return EUploadMimeType.Srt;
  if (type === "mp4" || type === "longmp4")
    return EUploadMimeType.Mp4;
  if (type === "mov")
    return EUploadMimeType.Mov;
  return type;
}
function getMediaCategoryByMime(name, target) {
  if (name === EUploadMimeType.Mp4 || name === EUploadMimeType.Mov)
    return target === "tweet" ? "TweetVideo" : "DmVideo";
  if (name === EUploadMimeType.Gif)
    return target === "tweet" ? "TweetGif" : "DmGif";
  if (name === EUploadMimeType.Srt)
    return "Subtitles";
  else
    return target === "tweet" ? "TweetImage" : "DmImage";
}
function sleepSecs(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1e3));
}
async function readNextPartOf(file, chunkLength, bufferOffset = 0, buffer) {
  if (file instanceof Buffer) {
    const rt = file.slice(bufferOffset, bufferOffset + chunkLength);
    return [rt, rt.length];
  }
  if (!buffer) {
    throw new Error("Well, we will need a buffer to store file content.");
  }
  let bytesRead;
  if (typeof file === "number") {
    bytesRead = await new Promise((resolve, reject) => {
      fs.read(file, buffer, 0, chunkLength, bufferOffset, (err, nread) => {
        if (err)
          reject(err);
        resolve(nread);
      });
    });
  } else {
    const res = await file.read(buffer, 0, chunkLength, bufferOffset);
    bytesRead = res.bytesRead;
  }
  return [buffer, bytesRead];
}

// node_modules/twitter-api-v2/dist/esm/v1/client.v1.write.js
var UPLOAD_ENDPOINT = "media/upload.json";
var TwitterApiv1ReadWrite = class extends TwitterApiv1ReadOnly {
  constructor() {
    super(...arguments);
    this._prefix = API_V1_1_PREFIX;
  }
  get readOnly() {
    return this;
  }
  tweet(status, payload = {}) {
    const queryParams = {
      status,
      tweet_mode: "extended",
      ...payload
    };
    return this.post("statuses/update.json", queryParams);
  }
  async quote(status, quotingStatusId, payload = {}) {
    const url = "https://x.com/i/statuses/" + quotingStatusId;
    return this.tweet(status, { ...payload, attachment_url: url });
  }
  async tweetThread(tweets) {
    const postedTweets = [];
    for (const tweet of tweets) {
      const lastTweet = postedTweets.length ? postedTweets[postedTweets.length - 1] : null;
      const queryParams = { ...typeof tweet === "string" ? { status: tweet } : tweet };
      const inReplyToId = lastTweet ? lastTweet.id_str : queryParams.in_reply_to_status_id;
      const status = queryParams.status;
      if (inReplyToId) {
        postedTweets.push(await this.reply(status, inReplyToId, queryParams));
      } else {
        postedTweets.push(await this.tweet(status, queryParams));
      }
    }
    return postedTweets;
  }
  reply(status, in_reply_to_status_id, payload = {}) {
    return this.tweet(status, {
      auto_populate_reply_metadata: true,
      in_reply_to_status_id,
      ...payload
    });
  }
  deleteTweet(tweetId) {
    return this.post("statuses/destroy/:id.json", { tweet_mode: "extended" }, { params: { id: tweetId } });
  }
  reportUserAsSpam(options) {
    return this.post("users/report_spam.json", { tweet_mode: "extended", ...options });
  }
  updateFriendship(options) {
    return this.post("friendships/update.json", options);
  }
  createFriendship(options) {
    return this.post("friendships/create.json", options);
  }
  destroyFriendship(options) {
    return this.post("friendships/destroy.json", options);
  }
  updateAccountSettings(options) {
    return this.post("account/settings.json", options);
  }
  updateAccountProfile(options) {
    return this.post("account/update_profile.json", options);
  }
  async updateAccountProfileBanner(file, options = {}) {
    const queryParams = {
      banner: await readFileIntoBuffer(file),
      ...options
    };
    return this.post("account/update_profile_banner.json", queryParams, { forceBodyMode: "form-data" });
  }
  async updateAccountProfileImage(file, options = {}) {
    const queryParams = {
      tweet_mode: "extended",
      image: await readFileIntoBuffer(file),
      ...options
    };
    return this.post("account/update_profile_image.json", queryParams, { forceBodyMode: "form-data" });
  }
  removeAccountProfileBanner() {
    return this.post("account/remove_profile_banner.json");
  }
  createList(options) {
    return this.post("lists/create.json", { tweet_mode: "extended", ...options });
  }
  updateList(options) {
    return this.post("lists/update.json", { tweet_mode: "extended", ...options });
  }
  removeList(options) {
    return this.post("lists/destroy.json", { tweet_mode: "extended", ...options });
  }
  addListMembers(options) {
    const hasMultiple = options.user_id && hasMultipleItems(options.user_id) || options.screen_name && hasMultipleItems(options.screen_name);
    const endpoint = hasMultiple ? "lists/members/create_all.json" : "lists/members/create.json";
    return this.post(endpoint, options);
  }
  removeListMembers(options) {
    const hasMultiple = options.user_id && hasMultipleItems(options.user_id) || options.screen_name && hasMultipleItems(options.screen_name);
    const endpoint = hasMultiple ? "lists/members/destroy_all.json" : "lists/members/destroy.json";
    return this.post(endpoint, options);
  }
  subscribeToList(options) {
    return this.post("lists/subscribers/create.json", { tweet_mode: "extended", ...options });
  }
  unsubscribeOfList(options) {
    return this.post("lists/subscribers/destroy.json", { tweet_mode: "extended", ...options });
  }
  createMediaMetadata(mediaId, metadata) {
    return this.post("media/metadata/create.json", { media_id: mediaId, ...metadata }, { prefix: API_V1_1_UPLOAD_PREFIX, forceBodyMode: "json" });
  }
  createMediaSubtitles(mediaId, subtitles) {
    return this.post("media/subtitles/create.json", { media_id: mediaId, media_category: "TweetVideo", subtitle_info: { subtitles } }, { prefix: API_V1_1_UPLOAD_PREFIX, forceBodyMode: "json" });
  }
  deleteMediaSubtitles(mediaId, ...languages) {
    return this.post("media/subtitles/delete.json", {
      media_id: mediaId,
      media_category: "TweetVideo",
      subtitle_info: { subtitles: languages.map((lang) => ({ language_code: lang })) }
    }, { prefix: API_V1_1_UPLOAD_PREFIX, forceBodyMode: "json" });
  }
  async uploadMedia(file, options = {}, returnFullMediaData = false) {
    var _a;
    const chunkLength = (_a = options.chunkLength) !== null && _a !== void 0 ? _a : 1024 * 1024;
    const { fileHandle, mediaCategory, fileSize, mimeType } = await this.getUploadMediaRequirements(file, options);
    try {
      const mediaData = await this.post(UPLOAD_ENDPOINT, {
        command: "INIT",
        total_bytes: fileSize,
        media_type: mimeType,
        media_category: mediaCategory,
        additional_owners: options.additionalOwners,
        shared: options.shared ? true : void 0
      }, { prefix: API_V1_1_UPLOAD_PREFIX });
      await this.mediaChunkedUpload(fileHandle, chunkLength, mediaData.media_id_string, options.maxConcurrentUploads);
      const fullMediaData = await this.post(UPLOAD_ENDPOINT, {
        command: "FINALIZE",
        media_id: mediaData.media_id_string
      }, { prefix: API_V1_1_UPLOAD_PREFIX });
      if (fullMediaData.processing_info && fullMediaData.processing_info.state !== "succeeded") {
        await this.awaitForMediaProcessingCompletion(fullMediaData);
      }
      if (returnFullMediaData) {
        return fullMediaData;
      } else {
        return fullMediaData.media_id_string;
      }
    } finally {
      if (typeof file === "number") {
        fs2.close(file, () => {
        });
      } else if (typeof fileHandle === "object" && !(fileHandle instanceof Buffer)) {
        fileHandle.close();
      }
    }
  }
  async awaitForMediaProcessingCompletion(fullMediaData) {
    var _a;
    while (true) {
      fullMediaData = await this.mediaInfo(fullMediaData.media_id_string);
      const { processing_info } = fullMediaData;
      if (!processing_info || processing_info.state === "succeeded") {
        return;
      }
      if ((_a = processing_info.error) === null || _a === void 0 ? void 0 : _a.code) {
        const { name, message } = processing_info.error;
        throw new Error(`Failed to process media: ${name} - ${message}.`);
      }
      if (processing_info.state === "failed") {
        throw new Error("Failed to process the media.");
      }
      if (processing_info.check_after_secs) {
        await sleepSecs(processing_info.check_after_secs);
      } else {
        await sleepSecs(5);
      }
    }
  }
  async getUploadMediaRequirements(file, { mimeType, type, target, longVideo } = {}) {
    let fileHandle;
    try {
      fileHandle = await getFileHandle(file);
      const realMimeType = getMimeType(file, type, mimeType);
      let mediaCategory;
      if (realMimeType === EUploadMimeType.Mp4 && (!mimeType && !type && target !== "dm" || longVideo)) {
        mediaCategory = "amplify_video";
      } else {
        mediaCategory = getMediaCategoryByMime(realMimeType, target !== null && target !== void 0 ? target : "tweet");
      }
      return {
        fileHandle,
        mediaCategory,
        fileSize: await getFileSizeFromFileHandle(fileHandle),
        mimeType: realMimeType
      };
    } catch (e) {
      if (typeof file === "number") {
        fs2.close(file, () => {
        });
      } else if (typeof fileHandle === "object" && !(fileHandle instanceof Buffer)) {
        fileHandle.close();
      }
      throw e;
    }
  }
  async mediaChunkedUpload(fileHandle, chunkLength, mediaId, maxConcurrentUploads = 3) {
    let chunkIndex = 0;
    if (maxConcurrentUploads < 1) {
      throw new RangeError("Bad maxConcurrentUploads parameter.");
    }
    const buffer = fileHandle instanceof Buffer ? void 0 : Buffer.alloc(chunkLength);
    let readBuffer;
    let nread;
    let offset = 0;
    [readBuffer, nread] = await readNextPartOf(fileHandle, chunkLength, offset, buffer);
    offset += nread;
    const currentUploads = new Set();
    while (nread) {
      const mediaBufferPart = readBuffer.slice(0, nread);
      if (mediaBufferPart.length) {
        const request3 = this.post(UPLOAD_ENDPOINT, {
          command: "APPEND",
          media_id: mediaId,
          segment_index: chunkIndex,
          media: mediaBufferPart
        }, { prefix: API_V1_1_UPLOAD_PREFIX });
        currentUploads.add(request3);
        request3.then(() => {
          currentUploads.delete(request3);
        });
        chunkIndex++;
      }
      if (currentUploads.size >= maxConcurrentUploads) {
        await Promise.race(currentUploads);
      }
      [readBuffer, nread] = await readNextPartOf(fileHandle, chunkLength, offset, buffer);
      offset += nread;
    }
    await Promise.all([...currentUploads]);
  }
};

// node_modules/twitter-api-v2/dist/esm/v1/client.v1.js
var TwitterApiv1 = class extends TwitterApiv1ReadWrite {
  constructor() {
    super(...arguments);
    this._prefix = API_V1_1_PREFIX;
  }
  get readWrite() {
    return this;
  }
  sendDm({ recipient_id, custom_profile_id, ...params }) {
    const args = {
      event: {
        type: EDirectMessageEventTypeV1.Create,
        [EDirectMessageEventTypeV1.Create]: {
          target: { recipient_id },
          message_data: params
        }
      }
    };
    if (custom_profile_id) {
      args.event[EDirectMessageEventTypeV1.Create].custom_profile_id = custom_profile_id;
    }
    return this.post("direct_messages/events/new.json", args, {
      forceBodyMode: "json"
    });
  }
  getDmEvent(id) {
    return this.get("direct_messages/events/show.json", { id });
  }
  deleteDm(id) {
    return this.delete("direct_messages/events/destroy.json", { id });
  }
  async listDmEvents(args = {}) {
    const queryParams = { ...args };
    const initialRq = await this.get("direct_messages/events/list.json", queryParams, { fullResponse: true });
    return new DmEventsV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  newWelcomeDm(name, data) {
    const args = {
      [EDirectMessageEventTypeV1.WelcomeCreate]: {
        name,
        message_data: data
      }
    };
    return this.post("direct_messages/welcome_messages/new.json", args, {
      forceBodyMode: "json"
    });
  }
  getWelcomeDm(id) {
    return this.get("direct_messages/welcome_messages/show.json", { id });
  }
  deleteWelcomeDm(id) {
    return this.delete("direct_messages/welcome_messages/destroy.json", { id });
  }
  updateWelcomeDm(id, data) {
    const args = { message_data: data };
    return this.put("direct_messages/welcome_messages/update.json", args, {
      forceBodyMode: "json",
      query: { id }
    });
  }
  async listWelcomeDms(args = {}) {
    const queryParams = { ...args };
    const initialRq = await this.get("direct_messages/welcome_messages/list.json", queryParams, { fullResponse: true });
    return new WelcomeDmV1Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  newWelcomeDmRule(welcomeMessageId) {
    return this.post("direct_messages/welcome_messages/rules/new.json", {
      welcome_message_rule: { welcome_message_id: welcomeMessageId }
    }, {
      forceBodyMode: "json"
    });
  }
  getWelcomeDmRule(id) {
    return this.get("direct_messages/welcome_messages/rules/show.json", { id });
  }
  deleteWelcomeDmRule(id) {
    return this.delete("direct_messages/welcome_messages/rules/destroy.json", { id });
  }
  async listWelcomeDmRules(args = {}) {
    const queryParams = { ...args };
    return this.get("direct_messages/welcome_messages/rules/list.json", queryParams);
  }
  async setWelcomeDm(welcomeMessageId, deleteAssociatedWelcomeDmWhenDeletingRule = true) {
    var _a;
    const existingRules = await this.listWelcomeDmRules();
    if ((_a = existingRules.welcome_message_rules) === null || _a === void 0 ? void 0 : _a.length) {
      for (const rule of existingRules.welcome_message_rules) {
        await this.deleteWelcomeDmRule(rule.id);
        if (deleteAssociatedWelcomeDmWhenDeletingRule) {
          await this.deleteWelcomeDm(rule.welcome_message_id);
        }
      }
    }
    return this.newWelcomeDmRule(welcomeMessageId);
  }
  markDmAsRead(lastEventId, recipientId) {
    return this.post("direct_messages/mark_read.json", {
      last_read_event_id: lastEventId,
      recipient_id: recipientId
    }, { forceBodyMode: "url" });
  }
  indicateDmTyping(recipientId) {
    return this.post("direct_messages/indicate_typing.json", {
      recipient_id: recipientId
    }, { forceBodyMode: "url" });
  }
  async downloadDmImage(urlOrDm) {
    if (typeof urlOrDm !== "string") {
      const attachment = urlOrDm[EDirectMessageEventTypeV1.Create].message_data.attachment;
      if (!attachment) {
        throw new Error("The given direct message doesn't contain any attachment");
      }
      urlOrDm = attachment.media.media_url_https;
    }
    const data = await this.get(urlOrDm, void 0, { forceParseMode: "buffer", prefix: "" });
    if (!data.length) {
      throw new Error("Image not found. Make sure you are logged with credentials able to access direct messages, and check the URL.");
    }
    return data;
  }
};
var client_v1_default = TwitterApiv1;

// node_modules/twitter-api-v2/dist/esm/v2/includes.v2.helper.js
var TwitterV2IncludesHelper = class {
  constructor(result) {
    this.result = result;
  }
  get tweets() {
    return TwitterV2IncludesHelper.tweets(this.result);
  }
  static tweets(result) {
    var _a, _b;
    return (_b = (_a = result.includes) === null || _a === void 0 ? void 0 : _a.tweets) !== null && _b !== void 0 ? _b : [];
  }
  tweetById(id) {
    return TwitterV2IncludesHelper.tweetById(this.result, id);
  }
  static tweetById(result, id) {
    return this.tweets(result).find((tweet) => tweet.id === id);
  }
  retweet(tweet) {
    return TwitterV2IncludesHelper.retweet(this.result, tweet);
  }
  static retweet(result, tweet) {
    var _a;
    const retweetIds = ((_a = tweet.referenced_tweets) !== null && _a !== void 0 ? _a : []).filter((ref) => ref.type === "retweeted").map((ref) => ref.id);
    return this.tweets(result).find((t) => retweetIds.includes(t.id));
  }
  quote(tweet) {
    return TwitterV2IncludesHelper.quote(this.result, tweet);
  }
  static quote(result, tweet) {
    var _a;
    const quoteIds = ((_a = tweet.referenced_tweets) !== null && _a !== void 0 ? _a : []).filter((ref) => ref.type === "quoted").map((ref) => ref.id);
    return this.tweets(result).find((t) => quoteIds.includes(t.id));
  }
  repliedTo(tweet) {
    return TwitterV2IncludesHelper.repliedTo(this.result, tweet);
  }
  static repliedTo(result, tweet) {
    var _a;
    const repliesIds = ((_a = tweet.referenced_tweets) !== null && _a !== void 0 ? _a : []).filter((ref) => ref.type === "replied_to").map((ref) => ref.id);
    return this.tweets(result).find((t) => repliesIds.includes(t.id));
  }
  author(tweet) {
    return TwitterV2IncludesHelper.author(this.result, tweet);
  }
  static author(result, tweet) {
    const authorId = tweet.author_id;
    return authorId ? this.users(result).find((u) => u.id === authorId) : void 0;
  }
  repliedToAuthor(tweet) {
    return TwitterV2IncludesHelper.repliedToAuthor(this.result, tweet);
  }
  static repliedToAuthor(result, tweet) {
    const inReplyUserId = tweet.in_reply_to_user_id;
    return inReplyUserId ? this.users(result).find((u) => u.id === inReplyUserId) : void 0;
  }
  get users() {
    return TwitterV2IncludesHelper.users(this.result);
  }
  static users(result) {
    var _a, _b;
    return (_b = (_a = result.includes) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
  }
  userById(id) {
    return TwitterV2IncludesHelper.userById(this.result, id);
  }
  static userById(result, id) {
    return this.users(result).find((u) => u.id === id);
  }
  pinnedTweet(user) {
    return TwitterV2IncludesHelper.pinnedTweet(this.result, user);
  }
  static pinnedTweet(result, user) {
    return user.pinned_tweet_id ? this.tweets(result).find((t) => t.id === user.pinned_tweet_id) : void 0;
  }
  get media() {
    return TwitterV2IncludesHelper.media(this.result);
  }
  static media(result) {
    var _a, _b;
    return (_b = (_a = result.includes) === null || _a === void 0 ? void 0 : _a.media) !== null && _b !== void 0 ? _b : [];
  }
  medias(tweet) {
    return TwitterV2IncludesHelper.medias(this.result, tweet);
  }
  static medias(result, tweet) {
    var _a, _b;
    const keys = (_b = (_a = tweet.attachments) === null || _a === void 0 ? void 0 : _a.media_keys) !== null && _b !== void 0 ? _b : [];
    return this.media(result).filter((m) => keys.includes(m.media_key));
  }
  get polls() {
    return TwitterV2IncludesHelper.polls(this.result);
  }
  static polls(result) {
    var _a, _b;
    return (_b = (_a = result.includes) === null || _a === void 0 ? void 0 : _a.polls) !== null && _b !== void 0 ? _b : [];
  }
  poll(tweet) {
    return TwitterV2IncludesHelper.poll(this.result, tweet);
  }
  static poll(result, tweet) {
    var _a, _b;
    const pollIds = (_b = (_a = tweet.attachments) === null || _a === void 0 ? void 0 : _a.poll_ids) !== null && _b !== void 0 ? _b : [];
    if (pollIds.length) {
      const pollId = pollIds[0];
      return this.polls(result).find((p) => p.id === pollId);
    }
    return void 0;
  }
  get places() {
    return TwitterV2IncludesHelper.places(this.result);
  }
  static places(result) {
    var _a, _b;
    return (_b = (_a = result.includes) === null || _a === void 0 ? void 0 : _a.places) !== null && _b !== void 0 ? _b : [];
  }
  place(tweet) {
    return TwitterV2IncludesHelper.place(this.result, tweet);
  }
  static place(result, tweet) {
    var _a;
    const placeId = (_a = tweet.geo) === null || _a === void 0 ? void 0 : _a.place_id;
    return placeId ? this.places(result).find((p) => p.id === placeId) : void 0;
  }
  listOwner(list) {
    return TwitterV2IncludesHelper.listOwner(this.result, list);
  }
  static listOwner(result, list) {
    const creatorId = list.owner_id;
    return creatorId ? this.users(result).find((p) => p.id === creatorId) : void 0;
  }
  spaceCreator(space) {
    return TwitterV2IncludesHelper.spaceCreator(this.result, space);
  }
  static spaceCreator(result, space) {
    const creatorId = space.creator_id;
    return creatorId ? this.users(result).find((p) => p.id === creatorId) : void 0;
  }
  spaceHosts(space) {
    return TwitterV2IncludesHelper.spaceHosts(this.result, space);
  }
  static spaceHosts(result, space) {
    var _a;
    const hostIds = (_a = space.host_ids) !== null && _a !== void 0 ? _a : [];
    return this.users(result).filter((u) => hostIds.includes(u.id));
  }
  spaceSpeakers(space) {
    return TwitterV2IncludesHelper.spaceSpeakers(this.result, space);
  }
  static spaceSpeakers(result, space) {
    var _a;
    const speakerIds = (_a = space.speaker_ids) !== null && _a !== void 0 ? _a : [];
    return this.users(result).filter((u) => speakerIds.includes(u.id));
  }
  spaceInvitedUsers(space) {
    return TwitterV2IncludesHelper.spaceInvitedUsers(this.result, space);
  }
  static spaceInvitedUsers(result, space) {
    var _a;
    const invitedUserIds = (_a = space.invited_user_ids) !== null && _a !== void 0 ? _a : [];
    return this.users(result).filter((u) => invitedUserIds.includes(u.id));
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/v2.paginator.js
var TwitterV2Paginator = class extends PreviousableTwitterPaginator {
  updateIncludes(data) {
    if (data.errors) {
      if (!this._realData.errors) {
        this._realData.errors = [];
      }
      this._realData.errors = [...this._realData.errors, ...data.errors];
    }
    if (!data.includes) {
      return;
    }
    if (!this._realData.includes) {
      this._realData.includes = {};
    }
    const includesRealData = this._realData.includes;
    for (const [includeKey, includeArray] of Object.entries(data.includes)) {
      if (!includesRealData[includeKey]) {
        includesRealData[includeKey] = [];
      }
      includesRealData[includeKey] = [
        ...includesRealData[includeKey],
        ...includeArray
      ];
    }
  }
  assertUsable() {
    if (this.unusable) {
      throw new Error("Unable to use this paginator to fetch more data, as it does not contain any metadata. Check .errors property for more details.");
    }
  }
  get meta() {
    return this._realData.meta;
  }
  get includes() {
    var _a;
    if (!((_a = this._realData) === null || _a === void 0 ? void 0 : _a.includes)) {
      return new TwitterV2IncludesHelper(this._realData);
    }
    if (this._includesInstance) {
      return this._includesInstance;
    }
    return this._includesInstance = new TwitterV2IncludesHelper(this._realData);
  }
  get errors() {
    var _a;
    return (_a = this._realData.errors) !== null && _a !== void 0 ? _a : [];
  }
  get unusable() {
    return this.errors.length > 0 && !this._realData.meta && !this._realData.data;
  }
};
var TimelineV2Paginator = class extends TwitterV2Paginator {
  refreshInstanceFromResult(response, isNextPage) {
    var _a;
    const result = response.data;
    const resultData = (_a = result.data) !== null && _a !== void 0 ? _a : [];
    this._rateLimit = response.rateLimit;
    if (!this._realData.data) {
      this._realData.data = [];
    }
    if (isNextPage) {
      this._realData.meta.result_count += result.meta.result_count;
      this._realData.meta.next_token = result.meta.next_token;
      this._realData.data.push(...resultData);
    } else {
      this._realData.meta.result_count += result.meta.result_count;
      this._realData.meta.previous_token = result.meta.previous_token;
      this._realData.data.unshift(...resultData);
    }
    this.updateIncludes(result);
  }
  getNextQueryParams(maxResults) {
    this.assertUsable();
    return {
      ...this.injectQueryParams(maxResults),
      pagination_token: this._realData.meta.next_token
    };
  }
  getPreviousQueryParams(maxResults) {
    this.assertUsable();
    return {
      ...this.injectQueryParams(maxResults),
      pagination_token: this._realData.meta.previous_token
    };
  }
  getPageLengthFromRequest(result) {
    var _a, _b;
    return (_b = (_a = result.data.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
  }
  isFetchLastOver(result) {
    var _a;
    return !((_a = result.data.data) === null || _a === void 0 ? void 0 : _a.length) || !this.canFetchNextPage(result.data);
  }
  canFetchNextPage(result) {
    var _a;
    return !!((_a = result.meta) === null || _a === void 0 ? void 0 : _a.next_token);
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/tweet.paginator.v2.js
var TweetTimelineV2Paginator = class extends TwitterV2Paginator {
  refreshInstanceFromResult(response, isNextPage) {
    var _a;
    const result = response.data;
    const resultData = (_a = result.data) !== null && _a !== void 0 ? _a : [];
    this._rateLimit = response.rateLimit;
    if (!this._realData.data) {
      this._realData.data = [];
    }
    if (isNextPage) {
      this._realData.meta.oldest_id = result.meta.oldest_id;
      this._realData.meta.result_count += result.meta.result_count;
      this._realData.meta.next_token = result.meta.next_token;
      this._realData.data.push(...resultData);
    } else {
      this._realData.meta.newest_id = result.meta.newest_id;
      this._realData.meta.result_count += result.meta.result_count;
      this._realData.data.unshift(...resultData);
    }
    this.updateIncludes(result);
  }
  getNextQueryParams(maxResults) {
    this.assertUsable();
    const params = { ...this.injectQueryParams(maxResults) };
    if (this._realData.meta.next_token) {
      params.next_token = this._realData.meta.next_token;
    } else {
      if (params.start_time) {
        params.since_id = this.dateStringToSnowflakeId(params.start_time);
        delete params.start_time;
      }
      if (params.end_time) {
        delete params.end_time;
      }
      params.until_id = this._realData.meta.oldest_id;
    }
    return params;
  }
  getPreviousQueryParams(maxResults) {
    this.assertUsable();
    return {
      ...this.injectQueryParams(maxResults),
      since_id: this._realData.meta.newest_id
    };
  }
  getPageLengthFromRequest(result) {
    var _a, _b;
    return (_b = (_a = result.data.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
  }
  isFetchLastOver(result) {
    var _a;
    return !((_a = result.data.data) === null || _a === void 0 ? void 0 : _a.length) || !this.canFetchNextPage(result.data);
  }
  canFetchNextPage(result) {
    return !!result.meta.next_token;
  }
  getItemArray() {
    return this.tweets;
  }
  dateStringToSnowflakeId(dateStr) {
    const TWITTER_START_EPOCH = BigInt("1288834974657");
    const date = new Date(dateStr);
    if (isNaN(date.valueOf())) {
      throw new Error("Unable to convert start_time/end_time to a valid date. A ISO 8601 DateTime is excepted, please check your input.");
    }
    const dateTimestamp = BigInt(date.valueOf());
    return (dateTimestamp - TWITTER_START_EPOCH << BigInt("22")).toString();
  }
  get tweets() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
};
var TweetPaginableTimelineV2Paginator = class extends TimelineV2Paginator {
  refreshInstanceFromResult(response, isNextPage) {
    super.refreshInstanceFromResult(response, isNextPage);
    const result = response.data;
    if (isNextPage) {
      this._realData.meta.oldest_id = result.meta.oldest_id;
    } else {
      this._realData.meta.newest_id = result.meta.newest_id;
    }
  }
  getItemArray() {
    return this.tweets;
  }
  get tweets() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
};
var TweetSearchRecentV2Paginator = class extends TweetTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "tweets/search/recent";
  }
};
var TweetSearchAllV2Paginator = class extends TweetTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "tweets/search/all";
  }
};
var QuotedTweetsTimelineV2Paginator = class extends TweetPaginableTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "tweets/:id/quote_tweets";
  }
};
var TweetHomeTimelineV2Paginator = class extends TweetPaginableTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/timelines/reverse_chronological";
  }
};
var TweetUserTimelineV2Paginator = class extends TweetPaginableTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/tweets";
  }
};
var TweetUserMentionTimelineV2Paginator = class extends TweetPaginableTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/mentions";
  }
};
var TweetBookmarksTimelineV2Paginator = class extends TweetPaginableTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/bookmarks";
  }
};
var TweetListV2Paginator = class extends TimelineV2Paginator {
  get tweets() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
  getItemArray() {
    return this.tweets;
  }
};
var TweetV2UserLikedTweetsPaginator = class extends TweetListV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/liked_tweets";
  }
};
var TweetV2ListTweetsPaginator = class extends TweetListV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/:id/tweets";
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/user.paginator.v2.js
var UserTimelineV2Paginator = class extends TimelineV2Paginator {
  getItemArray() {
    return this.users;
  }
  get users() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
};
var UserBlockingUsersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/blocking";
  }
};
var UserMutingUsersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/muting";
  }
};
var UserFollowersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/followers";
  }
};
var UserFollowingV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/following";
  }
};
var UserListMembersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/:id/members";
  }
};
var UserListFollowersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "lists/:id/followers";
  }
};
var TweetLikingUsersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "tweets/:id/liking_users";
  }
};
var TweetRetweetersUsersV2Paginator = class extends UserTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "tweets/:id/retweeted_by";
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/list.paginator.v2.js
var ListTimelineV2Paginator = class extends TimelineV2Paginator {
  getItemArray() {
    return this.lists;
  }
  get lists() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
};
var UserOwnedListsV2Paginator = class extends ListTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/owned_lists";
  }
};
var UserListMembershipsV2Paginator = class extends ListTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/list_memberships";
  }
};
var UserListFollowedV2Paginator = class extends ListTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "users/:id/followed_lists";
  }
};

// node_modules/twitter-api-v2/dist/esm/v2-labs/client.v2.labs.read.js
var TwitterApiv2LabsReadOnly = class extends TwitterApiSubClient {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_LABS_PREFIX;
  }
};

// node_modules/twitter-api-v2/dist/esm/paginators/dm.paginator.v2.js
var DMTimelineV2Paginator = class extends TimelineV2Paginator {
  getItemArray() {
    return this.events;
  }
  get events() {
    var _a;
    return (_a = this._realData.data) !== null && _a !== void 0 ? _a : [];
  }
  get meta() {
    return super.meta;
  }
};
var FullDMTimelineV2Paginator = class extends DMTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "dm_events";
  }
};
var OneToOneDMTimelineV2Paginator = class extends DMTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "dm_conversations/with/:participant_id/dm_events";
  }
};
var ConversationDMTimelineV2Paginator = class extends DMTimelineV2Paginator {
  constructor() {
    super(...arguments);
    this._endpoint = "dm_conversations/:dm_conversation_id/dm_events";
  }
};

// node_modules/twitter-api-v2/dist/esm/v2/client.v2.read.js
var TwitterApiv2ReadOnly = class extends TwitterApiSubClient {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_PREFIX;
  }
  get labs() {
    if (this._labs)
      return this._labs;
    return this._labs = new TwitterApiv2LabsReadOnly(this);
  }
  async search(queryOrOptions, options = {}) {
    const queryParams = typeof queryOrOptions === "string" ? { ...options, query: queryOrOptions } : { ...queryOrOptions };
    const initialRq = await this.get("tweets/search/recent", queryParams, { fullResponse: true });
    return new TweetSearchRecentV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  async searchAll(query, options = {}) {
    const queryParams = { ...options, query };
    const initialRq = await this.get("tweets/search/all", queryParams, { fullResponse: true });
    return new TweetSearchAllV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams
    });
  }
  singleTweet(tweetId, options = {}) {
    return this.get("tweets/:id", options, { params: { id: tweetId } });
  }
  tweets(tweetIds, options = {}) {
    return this.get("tweets", { ids: tweetIds, ...options });
  }
  tweetCountRecent(query, options = {}) {
    return this.get("tweets/counts/recent", { query, ...options });
  }
  tweetCountAll(query, options = {}) {
    return this.get("tweets/counts/all", { query, ...options });
  }
  async tweetRetweetedBy(tweetId, options = {}) {
    const { asPaginator, ...parameters } = options;
    const initialRq = await this.get("tweets/:id/retweeted_by", parameters, {
      fullResponse: true,
      params: { id: tweetId }
    });
    if (!asPaginator) {
      return initialRq.data;
    }
    return new TweetRetweetersUsersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: parameters,
      sharedParams: { id: tweetId }
    });
  }
  async tweetLikedBy(tweetId, options = {}) {
    const { asPaginator, ...parameters } = options;
    const initialRq = await this.get("tweets/:id/liking_users", parameters, {
      fullResponse: true,
      params: { id: tweetId }
    });
    if (!asPaginator) {
      return initialRq.data;
    }
    return new TweetLikingUsersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: parameters,
      sharedParams: { id: tweetId }
    });
  }
  async homeTimeline(options = {}) {
    const meUser = await this.getCurrentUserV2Object();
    const initialRq = await this.get("users/:id/timelines/reverse_chronological", options, {
      fullResponse: true,
      params: { id: meUser.data.id }
    });
    return new TweetHomeTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: options,
      sharedParams: { id: meUser.data.id }
    });
  }
  async userTimeline(userId, options = {}) {
    const initialRq = await this.get("users/:id/tweets", options, {
      fullResponse: true,
      params: { id: userId }
    });
    return new TweetUserTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: options,
      sharedParams: { id: userId }
    });
  }
  async userMentionTimeline(userId, options = {}) {
    const initialRq = await this.get("users/:id/mentions", options, {
      fullResponse: true,
      params: { id: userId }
    });
    return new TweetUserMentionTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: options,
      sharedParams: { id: userId }
    });
  }
  async quotes(tweetId, options = {}) {
    const initialRq = await this.get("tweets/:id/quote_tweets", options, {
      fullResponse: true,
      params: { id: tweetId }
    });
    return new QuotedTweetsTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: options,
      sharedParams: { id: tweetId }
    });
  }
  async bookmarks(options = {}) {
    const user = await this.getCurrentUserV2Object();
    const initialRq = await this.get("users/:id/bookmarks", options, {
      fullResponse: true,
      params: { id: user.data.id }
    });
    return new TweetBookmarksTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: options,
      sharedParams: { id: user.data.id }
    });
  }
  me(options = {}) {
    return this.get("users/me", options);
  }
  user(userId, options = {}) {
    return this.get("users/:id", options, { params: { id: userId } });
  }
  users(userIds, options = {}) {
    const ids = Array.isArray(userIds) ? userIds.join(",") : userIds;
    return this.get("users", { ...options, ids });
  }
  userByUsername(username, options = {}) {
    return this.get("users/by/username/:username", options, { params: { username } });
  }
  usersByUsernames(usernames, options = {}) {
    usernames = Array.isArray(usernames) ? usernames.join(",") : usernames;
    return this.get("users/by", { ...options, usernames });
  }
  async followers(userId, options = {}) {
    const { asPaginator, ...parameters } = options;
    const params = { id: userId };
    if (!asPaginator) {
      return this.get("users/:id/followers", parameters, { params });
    }
    const initialRq = await this.get("users/:id/followers", parameters, { fullResponse: true, params });
    return new UserFollowersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: parameters,
      sharedParams: params
    });
  }
  async following(userId, options = {}) {
    const { asPaginator, ...parameters } = options;
    const params = { id: userId };
    if (!asPaginator) {
      return this.get("users/:id/following", parameters, { params });
    }
    const initialRq = await this.get("users/:id/following", parameters, { fullResponse: true, params });
    return new UserFollowingV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: parameters,
      sharedParams: params
    });
  }
  async userLikedTweets(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/liked_tweets", options, { fullResponse: true, params });
    return new TweetV2UserLikedTweetsPaginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async userBlockingUsers(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/blocking", options, { fullResponse: true, params });
    return new UserBlockingUsersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async userMutingUsers(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/muting", options, { fullResponse: true, params });
    return new UserMutingUsersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  list(id, options = {}) {
    return this.get("lists/:id", options, { params: { id } });
  }
  async listsOwned(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/owned_lists", options, { fullResponse: true, params });
    return new UserOwnedListsV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listMemberships(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/list_memberships", options, { fullResponse: true, params });
    return new UserListMembershipsV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listFollowed(userId, options = {}) {
    const params = { id: userId };
    const initialRq = await this.get("users/:id/followed_lists", options, { fullResponse: true, params });
    return new UserListFollowedV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listTweets(listId, options = {}) {
    const params = { id: listId };
    const initialRq = await this.get("lists/:id/tweets", options, { fullResponse: true, params });
    return new TweetV2ListTweetsPaginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listMembers(listId, options = {}) {
    const params = { id: listId };
    const initialRq = await this.get("lists/:id/members", options, { fullResponse: true, params });
    return new UserListMembersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listFollowers(listId, options = {}) {
    const params = { id: listId };
    const initialRq = await this.get("lists/:id/followers", options, { fullResponse: true, params });
    return new UserListFollowersV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listDmEvents(options = {}) {
    const initialRq = await this.get("dm_events", options, { fullResponse: true });
    return new FullDMTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options }
    });
  }
  async listDmEventsWithParticipant(participantId, options = {}) {
    const params = { participant_id: participantId };
    const initialRq = await this.get("dm_conversations/with/:participant_id/dm_events", options, { fullResponse: true, params });
    return new OneToOneDMTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  async listDmEventsOfConversation(dmConversationId, options = {}) {
    const params = { dm_conversation_id: dmConversationId };
    const initialRq = await this.get("dm_conversations/:dm_conversation_id/dm_events", options, { fullResponse: true, params });
    return new ConversationDMTimelineV2Paginator({
      realData: initialRq.data,
      rateLimit: initialRq.rateLimit,
      instance: this,
      queryParams: { ...options },
      sharedParams: params
    });
  }
  space(spaceId, options = {}) {
    return this.get("spaces/:id", options, { params: { id: spaceId } });
  }
  spaces(spaceIds, options = {}) {
    return this.get("spaces", { ids: spaceIds, ...options });
  }
  spacesByCreators(creatorIds, options = {}) {
    return this.get("spaces/by/creator_ids", { user_ids: creatorIds, ...options });
  }
  searchSpaces(options) {
    return this.get("spaces/search", options);
  }
  spaceBuyers(spaceId, options = {}) {
    return this.get("spaces/:id/buyers", options, { params: { id: spaceId } });
  }
  spaceTweets(spaceId, options = {}) {
    return this.get("spaces/:id/tweets", options, { params: { id: spaceId } });
  }
  searchStream({ autoConnect, ...options } = {}) {
    return this.getStream("tweets/search/stream", options, { payloadIsError: isTweetStreamV2ErrorPayload, autoConnect });
  }
  streamRules(options = {}) {
    return this.get("tweets/search/stream/rules", options);
  }
  updateStreamRules(options, query = {}) {
    return this.post("tweets/search/stream/rules", options, { query });
  }
  sampleStream({ autoConnect, ...options } = {}) {
    return this.getStream("tweets/sample/stream", options, { payloadIsError: isTweetStreamV2ErrorPayload, autoConnect });
  }
  sample10Stream({ autoConnect, ...options } = {}) {
    return this.getStream("tweets/sample10/stream", options, { payloadIsError: isTweetStreamV2ErrorPayload, autoConnect });
  }
  complianceJobs(options) {
    return this.get("compliance/jobs", options);
  }
  complianceJob(jobId) {
    return this.get("compliance/jobs/:id", void 0, { params: { id: jobId } });
  }
  async sendComplianceJob(jobParams) {
    const job = await this.post("compliance/jobs", { type: jobParams.type, name: jobParams.name });
    const rawIdsBody = jobParams.ids instanceof Buffer ? jobParams.ids : Buffer.from(jobParams.ids.join("\n"));
    await this.put(job.data.upload_url, rawIdsBody, {
      forceBodyMode: "raw",
      enableAuth: false,
      headers: { "Content-Type": "text/plain" },
      prefix: ""
    });
    return job;
  }
  async complianceJobResult(job) {
    let runningJob = job;
    while (runningJob.status !== "complete") {
      if (runningJob.status === "expired" || runningJob.status === "failed") {
        throw new Error("Job failed to be completed.");
      }
      await new Promise((resolve) => setTimeout(resolve, 3500));
      runningJob = (await this.complianceJob(job.id)).data;
    }
    const result = await this.get(job.download_url, void 0, {
      enableAuth: false,
      prefix: ""
    });
    return result.trim().split("\n").filter((line) => line).map((line) => JSON.parse(line));
  }
  async usage(options = {}) {
    return this.get("usage/tweets", options);
  }
  community(communityId, options = {}) {
    return this.get("communities/:id", options, { params: { id: communityId } });
  }
  searchCommunities(query, options = {}) {
    return this.get("communities/search", { query, ...options });
  }
};

// node_modules/twitter-api-v2/dist/esm/v2-labs/client.v2.labs.write.js
var TwitterApiv2LabsReadWrite = class extends TwitterApiv2LabsReadOnly {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_LABS_PREFIX;
  }
  get readOnly() {
    return this;
  }
};

// node_modules/twitter-api-v2/dist/esm/v2/client.v2.write.js
var TwitterApiv2ReadWrite = class extends TwitterApiv2ReadOnly {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_PREFIX;
  }
  get readOnly() {
    return this;
  }
  get labs() {
    if (this._labs)
      return this._labs;
    return this._labs = new TwitterApiv2LabsReadWrite(this);
  }
  hideReply(tweetId, makeHidden) {
    return this.put("tweets/:id/hidden", { hidden: makeHidden }, { params: { id: tweetId } });
  }
  like(loggedUserId, targetTweetId) {
    return this.post("users/:id/likes", { tweet_id: targetTweetId }, { params: { id: loggedUserId } });
  }
  unlike(loggedUserId, targetTweetId) {
    return this.delete("users/:id/likes/:tweet_id", void 0, {
      params: { id: loggedUserId, tweet_id: targetTweetId }
    });
  }
  retweet(loggedUserId, targetTweetId) {
    return this.post("users/:id/retweets", { tweet_id: targetTweetId }, { params: { id: loggedUserId } });
  }
  unretweet(loggedUserId, targetTweetId) {
    return this.delete("users/:id/retweets/:tweet_id", void 0, {
      params: { id: loggedUserId, tweet_id: targetTweetId }
    });
  }
  tweet(status, payload = {}) {
    if (typeof status === "object") {
      payload = status;
    } else {
      payload = { text: status, ...payload };
    }
    return this.post("tweets", payload);
  }
  async uploadMedia(media, options, chunkSize = 1024 * 1024) {
    let media_category = options.media_category;
    if (!options.media_category) {
      if (options.media_type.includes("gif")) {
        media_category = "tweet_gif";
      } else if (options.media_type.includes("image")) {
        media_category = "tweet_image";
      } else if (options.media_type.includes("video")) {
        media_category = "tweet_video";
      }
    }
    const initArguments = {
      command: "INIT",
      media_type: options.media_type,
      total_bytes: media.length,
      media_category
    };
    const initResponse = await this.post("media/upload", initArguments, { forceBodyMode: "form-data" });
    const mediaId = initResponse.data.id;
    const chunksCount = Math.ceil(media.length / chunkSize);
    const mediaArray = new Uint8Array(media);
    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, media.length);
      const mediaChunk = mediaArray.slice(start, end);
      const chunkedBuffer = Buffer.from(mediaChunk);
      const appendArguments = {
        command: "APPEND",
        media_id: mediaId,
        segment_index: i,
        media: chunkedBuffer
      };
      await this.post("media/upload", appendArguments, { forceBodyMode: "form-data" });
    }
    const finalizeArguments = {
      command: "FINALIZE",
      media_id: mediaId
    };
    const finalizeResponse = await this.post("media/upload", finalizeArguments, { forceBodyMode: "form-data" });
    if (finalizeResponse.data.processing_info) {
      await this.waitForMediaProcessing(mediaId);
    }
    return mediaId;
  }
  async waitForMediaProcessing(mediaId) {
    var _a;
    const response = await this.get("media/upload", {
      command: "STATUS",
      media_id: mediaId
    });
    const info = response.data.processing_info;
    if (!info)
      return;
    switch (info.state) {
      case "succeeded":
        return;
      case "failed":
        throw new Error(`Media processing failed: ${(_a = info.error) === null || _a === void 0 ? void 0 : _a.message}`);
      case "pending":
      case "in_progress": {
        const waitTime = info === null || info === void 0 ? void 0 : info.check_after_secs;
        if (waitTime && waitTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitTime * 1e3));
          await this.waitForMediaProcessing(mediaId);
        }
      }
    }
  }
  createMediaMetadata(mediaId, metadata) {
    return this.post("media/metadata", { id: mediaId, metadata });
  }
  reply(status, toTweetId, payload = {}) {
    var _a;
    const reply = { in_reply_to_tweet_id: toTweetId, ...(_a = payload.reply) !== null && _a !== void 0 ? _a : {} };
    return this.post("tweets", { text: status, ...payload, reply });
  }
  quote(status, quotedTweetId, payload = {}) {
    return this.tweet(status, { ...payload, quote_tweet_id: quotedTweetId });
  }
  async tweetThread(tweets) {
    var _a, _b;
    const postedTweets = [];
    for (const tweet of tweets) {
      const lastTweet = postedTweets.length ? postedTweets[postedTweets.length - 1] : null;
      const queryParams = { ...typeof tweet === "string" ? { text: tweet } : tweet };
      const inReplyToId = lastTweet ? lastTweet.data.id : (_a = queryParams.reply) === null || _a === void 0 ? void 0 : _a.in_reply_to_tweet_id;
      const status = (_b = queryParams.text) !== null && _b !== void 0 ? _b : "";
      if (inReplyToId) {
        postedTweets.push(await this.reply(status, inReplyToId, queryParams));
      } else {
        postedTweets.push(await this.tweet(status, queryParams));
      }
    }
    return postedTweets;
  }
  deleteTweet(tweetId) {
    return this.delete("tweets/:id", void 0, {
      params: {
        id: tweetId
      }
    });
  }
  async bookmark(tweetId) {
    const user = await this.getCurrentUserV2Object();
    return this.post("users/:id/bookmarks", { tweet_id: tweetId }, { params: { id: user.data.id } });
  }
  async deleteBookmark(tweetId) {
    const user = await this.getCurrentUserV2Object();
    return this.delete("users/:id/bookmarks/:tweet_id", void 0, { params: { id: user.data.id, tweet_id: tweetId } });
  }
  follow(loggedUserId, targetUserId) {
    return this.post("users/:id/following", { target_user_id: targetUserId }, { params: { id: loggedUserId } });
  }
  unfollow(loggedUserId, targetUserId) {
    return this.delete("users/:source_user_id/following/:target_user_id", void 0, {
      params: { source_user_id: loggedUserId, target_user_id: targetUserId }
    });
  }
  block(loggedUserId, targetUserId) {
    return this.post("users/:id/blocking", { target_user_id: targetUserId }, { params: { id: loggedUserId } });
  }
  unblock(loggedUserId, targetUserId) {
    return this.delete("users/:source_user_id/blocking/:target_user_id", void 0, {
      params: { source_user_id: loggedUserId, target_user_id: targetUserId }
    });
  }
  mute(loggedUserId, targetUserId) {
    return this.post("users/:id/muting", { target_user_id: targetUserId }, { params: { id: loggedUserId } });
  }
  unmute(loggedUserId, targetUserId) {
    return this.delete("users/:source_user_id/muting/:target_user_id", void 0, {
      params: { source_user_id: loggedUserId, target_user_id: targetUserId }
    });
  }
  createList(options) {
    return this.post("lists", options);
  }
  updateList(listId, options = {}) {
    return this.put("lists/:id", options, { params: { id: listId } });
  }
  removeList(listId) {
    return this.delete("lists/:id", void 0, { params: { id: listId } });
  }
  addListMember(listId, userId) {
    return this.post("lists/:id/members", { user_id: userId }, { params: { id: listId } });
  }
  removeListMember(listId, userId) {
    return this.delete("lists/:id/members/:user_id", void 0, { params: { id: listId, user_id: userId } });
  }
  subscribeToList(loggedUserId, listId) {
    return this.post("users/:id/followed_lists", { list_id: listId }, { params: { id: loggedUserId } });
  }
  unsubscribeOfList(loggedUserId, listId) {
    return this.delete("users/:id/followed_lists/:list_id", void 0, { params: { id: loggedUserId, list_id: listId } });
  }
  pinList(loggedUserId, listId) {
    return this.post("users/:id/pinned_lists", { list_id: listId }, { params: { id: loggedUserId } });
  }
  unpinList(loggedUserId, listId) {
    return this.delete("users/:id/pinned_lists/:list_id", void 0, { params: { id: loggedUserId, list_id: listId } });
  }
  sendDmInConversation(conversationId, message) {
    return this.post("dm_conversations/:dm_conversation_id/messages", message, { params: { dm_conversation_id: conversationId } });
  }
  sendDmToParticipant(participantId, message) {
    return this.post("dm_conversations/with/:participant_id/messages", message, { params: { participant_id: participantId } });
  }
  createDmConversation(options) {
    return this.post("dm_conversations", options);
  }
};

// node_modules/twitter-api-v2/dist/esm/v2-labs/client.v2.labs.js
var TwitterApiv2Labs = class extends TwitterApiv2LabsReadWrite {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_LABS_PREFIX;
  }
  get readWrite() {
    return this;
  }
};
var client_v2_labs_default = TwitterApiv2Labs;

// node_modules/twitter-api-v2/dist/esm/v2/client.v2.js
var TwitterApiv2 = class extends TwitterApiv2ReadWrite {
  constructor() {
    super(...arguments);
    this._prefix = API_V2_PREFIX;
  }
  get readWrite() {
    return this;
  }
  get labs() {
    if (this._labs)
      return this._labs;
    return this._labs = new client_v2_labs_default(this);
  }
};
var client_v2_default = TwitterApiv2;

// node_modules/twitter-api-v2/dist/esm/client/readonly.js
var TwitterApiReadOnly = class extends TwitterApiBase {
  get v1() {
    if (this._v1)
      return this._v1;
    return this._v1 = new TwitterApiv1ReadOnly(this);
  }
  get v2() {
    if (this._v2)
      return this._v2;
    return this._v2 = new TwitterApiv2ReadOnly(this);
  }
  async currentUser(forceFetch = false) {
    return await this.getCurrentUserObject(forceFetch);
  }
  async currentUserV2(forceFetch = false) {
    return await this.getCurrentUserV2Object(forceFetch);
  }
  search(what, options) {
    return this.v2.search(what, options);
  }
  async generateAuthLink(oauth_callback = "oob", { authAccessType, linkMode = "authenticate", forceLogin, screenName } = {}) {
    const oauthResult = await this.post("https://api.x.com/oauth/request_token", { oauth_callback, x_auth_access_type: authAccessType });
    let url = `https://api.x.com/oauth/${linkMode}?oauth_token=${encodeURIComponent(oauthResult.oauth_token)}`;
    if (forceLogin !== void 0) {
      url += `&force_login=${encodeURIComponent(forceLogin)}`;
    }
    if (screenName !== void 0) {
      url += `&screen_name=${encodeURIComponent(screenName)}`;
    }
    if (this._requestMaker.hasPlugins()) {
      this._requestMaker.applyPluginMethod("onOAuth1RequestToken", {
        client: this._requestMaker,
        url,
        oauthResult
      });
    }
    return {
      url,
      ...oauthResult
    };
  }
  async login(oauth_verifier) {
    const tokens = this.getActiveTokens();
    if (tokens.type !== "oauth-1.0a")
      throw new Error("You must setup TwitterApi instance with consumer keys to accept OAuth 1.0 login");
    const oauth_result = await this.post("https://api.x.com/oauth/access_token", { oauth_token: tokens.accessToken, oauth_verifier });
    const client = new client_default({
      appKey: tokens.appKey,
      appSecret: tokens.appSecret,
      accessToken: oauth_result.oauth_token,
      accessSecret: oauth_result.oauth_token_secret
    }, this._requestMaker.clientSettings);
    return {
      accessToken: oauth_result.oauth_token,
      accessSecret: oauth_result.oauth_token_secret,
      userId: oauth_result.user_id,
      screenName: oauth_result.screen_name,
      client
    };
  }
  async appLogin() {
    const tokens = this.getActiveTokens();
    if (tokens.type !== "oauth-1.0a")
      throw new Error("You must setup TwitterApi instance with consumer keys to accept app-only login");
    const basicClient = new client_default({ username: tokens.appKey, password: tokens.appSecret }, this._requestMaker.clientSettings);
    const res = await basicClient.post("https://api.x.com/oauth2/token", { grant_type: "client_credentials" });
    return new client_default(res.access_token, this._requestMaker.clientSettings);
  }
  generateOAuth2AuthLink(redirectUri, options = {}) {
    var _a, _b;
    if (!this._requestMaker.clientId) {
      throw new Error("Twitter API instance is not initialized with client ID. You can find your client ID in Twitter Developer Portal. Please build an instance with: new TwitterApi({ clientId: '<yourClientId>' })");
    }
    const state = (_a = options.state) !== null && _a !== void 0 ? _a : OAuth2Helper.generateRandomString(32);
    const codeVerifier = OAuth2Helper.getCodeVerifier();
    const codeChallenge = OAuth2Helper.getCodeChallengeFromVerifier(codeVerifier);
    const rawScope = (_b = options.scope) !== null && _b !== void 0 ? _b : "";
    const scope = Array.isArray(rawScope) ? rawScope.join(" ") : rawScope;
    const url = new URL("https://x.com/i/oauth2/authorize");
    const query = {
      response_type: "code",
      client_id: this._requestMaker.clientId,
      redirect_uri: redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "s256",
      scope
    };
    request_param_helper_default.addQueryParamsToUrl(url, query);
    const result = {
      url: url.toString(),
      state,
      codeVerifier,
      codeChallenge
    };
    if (this._requestMaker.hasPlugins()) {
      this._requestMaker.applyPluginMethod("onOAuth2RequestToken", {
        client: this._requestMaker,
        result,
        redirectUri
      });
    }
    return result;
  }
  async loginWithOAuth2({ code, codeVerifier, redirectUri }) {
    if (!this._requestMaker.clientId) {
      throw new Error("Twitter API instance is not initialized with client ID. Please build an instance with: new TwitterApi({ clientId: '<yourClientId>' })");
    }
    const accessTokenResult = await this.post("https://api.x.com/2/oauth2/token", {
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      client_id: this._requestMaker.clientId,
      client_secret: this._requestMaker.clientSecret
    });
    return this.parseOAuth2AccessTokenResult(accessTokenResult);
  }
  async refreshOAuth2Token(refreshToken) {
    if (!this._requestMaker.clientId) {
      throw new Error("Twitter API instance is not initialized with client ID. Please build an instance with: new TwitterApi({ clientId: '<yourClientId>' })");
    }
    const accessTokenResult = await this.post("https://api.x.com/2/oauth2/token", {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: this._requestMaker.clientId,
      client_secret: this._requestMaker.clientSecret
    });
    return this.parseOAuth2AccessTokenResult(accessTokenResult);
  }
  async revokeOAuth2Token(token, tokenType = "access_token") {
    if (!this._requestMaker.clientId) {
      throw new Error("Twitter API instance is not initialized with client ID. Please build an instance with: new TwitterApi({ clientId: '<yourClientId>' })");
    }
    return await this.post("https://api.x.com/2/oauth2/revoke", {
      client_id: this._requestMaker.clientId,
      client_secret: this._requestMaker.clientSecret,
      token,
      token_type_hint: tokenType
    });
  }
  parseOAuth2AccessTokenResult(result) {
    const client = new client_default(result.access_token, this._requestMaker.clientSettings);
    const scope = result.scope.split(" ").filter((e) => e);
    return {
      client,
      expiresIn: result.expires_in,
      accessToken: result.access_token,
      scope,
      refreshToken: result.refresh_token
    };
  }
};

// node_modules/twitter-api-v2/dist/esm/client/readwrite.js
var TwitterApiReadWrite = class extends TwitterApiReadOnly {
  get v1() {
    if (this._v1)
      return this._v1;
    return this._v1 = new TwitterApiv1ReadWrite(this);
  }
  get v2() {
    if (this._v2)
      return this._v2;
    return this._v2 = new TwitterApiv2ReadWrite(this);
  }
  get readOnly() {
    return this;
  }
};

// node_modules/twitter-api-v2/dist/esm/ads/client.ads.read.js
var TwitterAdsReadOnly = class extends TwitterApiSubClient {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_PREFIX;
  }
};

// node_modules/twitter-api-v2/dist/esm/ads/client.ads.write.js
var TwitterAdsReadWrite = class extends TwitterAdsReadOnly {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_PREFIX;
  }
  get readOnly() {
    return this;
  }
};

// node_modules/twitter-api-v2/dist/esm/ads-sandbox/client.ads-sandbox.read.js
var TwitterAdsSandboxReadOnly = class extends TwitterApiSubClient {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_SANDBOX_PREFIX;
  }
};

// node_modules/twitter-api-v2/dist/esm/ads-sandbox/client.ads-sandbox.write.js
var TwitterAdsSandboxReadWrite = class extends TwitterAdsSandboxReadOnly {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_SANDBOX_PREFIX;
  }
  get readOnly() {
    return this;
  }
};

// node_modules/twitter-api-v2/dist/esm/ads-sandbox/client.ads-sandbox.js
var TwitterAdsSandbox = class extends TwitterAdsSandboxReadWrite {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_SANDBOX_PREFIX;
  }
  get readWrite() {
    return this;
  }
};
var client_ads_sandbox_default = TwitterAdsSandbox;

// node_modules/twitter-api-v2/dist/esm/ads/client.ads.js
var TwitterAds = class extends TwitterAdsReadWrite {
  constructor() {
    super(...arguments);
    this._prefix = API_ADS_PREFIX;
  }
  get readWrite() {
    return this;
  }
  get sandbox() {
    if (this._sandbox)
      return this._sandbox;
    return this._sandbox = new client_ads_sandbox_default(this);
  }
};
var client_ads_default = TwitterAds;

// node_modules/twitter-api-v2/dist/esm/client/index.js
var TwitterApi = class extends TwitterApiReadWrite {
  get v1() {
    if (this._v1)
      return this._v1;
    return this._v1 = new client_v1_default(this);
  }
  get v2() {
    if (this._v2)
      return this._v2;
    return this._v2 = new client_v2_default(this);
  }
  get readWrite() {
    return this;
  }
  get ads() {
    if (this._ads)
      return this._ads;
    return this._ads = new client_ads_default(this);
  }
  static getErrors(error) {
    var _a;
    if (typeof error !== "object")
      return [];
    if (!("data" in error))
      return [];
    return (_a = error.data.errors) !== null && _a !== void 0 ? _a : [];
  }
  static getProfileImageInSize(profileImageUrl, size) {
    const lastPart = profileImageUrl.split("/").pop();
    const sizes = ["normal", "bigger", "mini"];
    let originalUrl = profileImageUrl;
    for (const availableSize of sizes) {
      if (lastPart.includes(`_${availableSize}`)) {
        originalUrl = profileImageUrl.replace(`_${availableSize}`, "");
        break;
      }
    }
    if (size === "original") {
      return originalUrl;
    }
    const extPos = originalUrl.lastIndexOf(".");
    if (extPos !== -1) {
      const ext = originalUrl.slice(extPos + 1);
      return originalUrl.slice(0, extPos) + "_" + size + "." + ext;
    } else {
      return originalUrl + "_" + size;
    }
  }
};
var client_default = TwitterApi;

// src/services/twitter-service.ts
var fs3 = __toModule(require("fs"));
var path = __toModule(require("path"));
var https = __toModule(require("https"));
var TwitterService = class {
  constructor(settings, saveSettingsCallback) {
    this.client = null;
    this.logFilePath = null;
    this.lastApiCallTime = 0;
    this.apiRateLimitWindow = 15 * 60 * 1e3;
    this.apiCallsInProgress = false;
    this.settings = settings;
    this.saveSettingsCallback = saveSettingsCallback;
    this.initializeClient();
    this.setupLogging();
  }
  setupLogging() {
    if (this.settings.logFile) {
      this.logFilePath = this.settings.logFile;
    } else {
      try {
        const pluginDir = path.dirname(window.require.main.filename);
        this.logFilePath = path.join(pluginDir, "bookmark-bridge-debug.log");
        this.log(`Set up logging to: ${this.logFilePath}`);
      } catch (error) {
        console.error("Failed to set up logging in plugin directory:", error);
        try {
          const homeDir = process.env.HOME || process.env.USERPROFILE || ".";
          const documentsDir = path.join(homeDir, "Documents");
          this.logFilePath = path.join(documentsDir, "bookmark-bridge-debug.log");
          this.log(`Using fallback log location: ${this.logFilePath}`);
          fs3.appendFileSync(this.logFilePath, "[TEST] Initializing log file\n");
        } catch (fallbackError) {
          console.error("Failed to set up fallback logging:", fallbackError);
          this.logFilePath = null;
        }
      }
    }
  }
  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}
`;
    if (type === "error") {
      console.error(logMessage);
    } else if (type === "debug") {
      console.debug(logMessage);
    } else {
      console.log(logMessage);
    }
    if (this.logFilePath) {
      try {
        fs3.appendFileSync(this.logFilePath, logMessage);
      } catch (error) {
        console.error("Failed to write to log file:", error);
        try {
          const dirPath = path.dirname(this.logFilePath);
          if (!fs3.existsSync(dirPath)) {
            fs3.mkdirSync(dirPath, { recursive: true });
          }
          fs3.writeFileSync(this.logFilePath, `[${timestamp}] [INFO] Log file recreated
${logMessage}`);
        } catch (recreateError) {
          console.error("Failed to recreate log file:", recreateError);
        }
      }
    }
  }
  initializeClient() {
    if (!this.settings.oauth2AccessToken) {
      this.log("Cannot initialize client: No access token available", "error");
      return;
    }
    try {
      this.log("Initializing Twitter API client with access token", "info");
      this.client = new TwitterApi(this.settings.oauth2AccessToken);
      this.log("Twitter API client initialized successfully", "info");
    } catch (error) {
      this.log(`Failed to initialize Twitter API client: ${error}`, "error");
      this.client = null;
    }
  }
  generateRandomString(length = 43) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  async generateCodeChallenge(codeVerifier) {
    try {
      this.log(`Generating code challenge from verifier (length: ${codeVerifier.length})`, "debug");
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      this.log(`Encoded verifier to ${data.length} bytes`, "debug");
      this.log("Applying SHA-256 hash...", "debug");
      const hash = await crypto.subtle.digest("SHA-256", data);
      this.log(`Hash generated, byte length: ${hash.byteLength}`, "debug");
      const base64Hash = this.arrayBufferToBase64(hash);
      this.log(`Base64 encoded hash: ${base64Hash}`, "debug");
      const base64urlHash = base64Hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      this.log(`Final base64url code challenge: ${base64urlHash}`, "debug");
      return base64urlHash;
    } catch (error) {
      this.log(`Error generating code challenge: ${error}`, "error");
      this.log("Your environment may not support the required cryptographic APIs.", "error");
      if (typeof crypto === "undefined" || typeof crypto.subtle === "undefined") {
        this.log("Web Crypto API is not available in this environment", "error");
      } else if (typeof TextEncoder === "undefined") {
        this.log("TextEncoder is not available in this environment", "error");
      }
      throw new Error("Failed to generate code challenge. Your environment may not support the required cryptographic APIs.");
    }
  }
  arrayBufferToBase64(buffer) {
    try {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      this.log(`Error in arrayBufferToBase64: ${error}`, "error");
      throw error;
    }
  }
  async generateAuthUrl(state) {
    if (!this.settings.clientId) {
      this.log("Client ID is required for OAuth 2.0 authorization", "error");
      throw new Error("Client ID is required for OAuth 2.0 authorization");
    }
    const codeVerifier = this.generateRandomString();
    this.log(`Generated code verifier for PKCE: ${codeVerifier}`, "debug");
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    this.log(`Generated code challenge: ${codeChallenge}`, "debug");
    const callbackUrl = "obsidian://bookmark-bridge/callback";
    this.log(`Using redirect_uri: ${callbackUrl}`, "info");
    this.log(`IMPORTANT: This must exactly match your registered Callback URL in Twitter Developer Portal`, "info");
    const authUrl = new URL("https://x.com/i/oauth2/authorize");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", this.settings.clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("scope", "bookmark.read tweet.read users.read offline.access");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    const urlString = authUrl.toString();
    this.log(`Generated Auth URL: ${urlString}`, "debug");
    return { url: urlString, codeVerifier };
  }
  extractAuthorizationCode(url) {
    this.log(`Attempting to extract authorization code from: ${url}`, "debug");
    try {
      const urlObj = new URL(url);
      if (urlObj.searchParams.has("error")) {
        const error = urlObj.searchParams.get("error");
        const errorDescription = urlObj.searchParams.get("error_description");
        this.log(`Authorization error: ${error} - ${errorDescription}`, "error");
        return null;
      }
      const code = urlObj.searchParams.get("code");
      if (code) {
        this.log(`Successfully extracted authorization code: ${code.substring(0, 10)}...`, "debug");
        return code;
      } else {
        this.log("No authorization code found in URL parameters", "error");
        return null;
      }
    } catch (e) {
      this.log(`Failed to parse URL, attempting regex extraction: ${e}`, "debug");
      const codeMatch = url.match(/[?&]code=([^&]+)/);
      if (codeMatch && codeMatch[1]) {
        this.log(`Found authorization code via regex: ${codeMatch[1].substring(0, 10)}...`, "debug");
        return codeMatch[1];
      }
      const errorMatch = url.match(/[?&]error=([^&]+)/);
      if (errorMatch && errorMatch[1]) {
        this.log(`Authorization error detected via regex: ${errorMatch[1]}`, "error");
        const errorDescMatch = url.match(/[?&]error_description=([^&]+)/);
        const errorDesc = errorDescMatch && errorDescMatch[1] ? decodeURIComponent(errorDescMatch[1]) : "No description";
        this.log(`Error description: ${errorDesc}`, "error");
        return null;
      }
      this.log("No authorization code found in string using regex", "error");
      return null;
    }
  }
  safeBase64Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let binaryStr = "";
    for (let i = 0; i < bytes.length; i++) {
      binaryStr += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binaryStr);
    return base64;
  }
  async nodeHttpRequest(requestUrl, options = {}, postData) {
    const method = options.method || "GET";
    const urlStr = requestUrl.toString();
    this.log(`API REQUEST: ${method} ${urlStr}`, "info");
    if (options.headers) {
      this.log(`Request headers: ${JSON.stringify(options.headers, (k, v) => k === "Authorization" ? "Bearer [REDACTED]" : v)}`, "debug");
    }
    if (postData) {
      const redactedData = postData.replace(/(client_secret|code|token|refresh_token)=([^&]+)/g, "$1=[REDACTED]");
      this.log(`Request body: ${redactedData}`, "debug");
    }
    await this.updateRateLimitTimestamp();
    return new Promise((resolve, reject) => {
      this.log(`Making Node.js HTTPS request to: ${urlStr}`, "debug");
      const parsedUrl = new URL(urlStr);
      const requestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        port: parsedUrl.port || 443,
        method: options.method || "GET",
        headers: options.headers || {},
        timeout: 1e4
      };
      this.log(`Request options: ${JSON.stringify(requestOptions, (k, v) => k === "headers" && v.Authorization ? { ...v, Authorization: "Bearer [REDACTED]" } : v)}`, "debug");
      const req = https.request(requestOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          this.log(`Response status code: ${res.statusCode}`, "debug");
          const rateLimitHeaders = Object.entries(res.headers).filter(([key]) => key.toLowerCase().includes("ratelimit") || key.toLowerCase().includes("x-rate-limit")).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});
          if (Object.keys(rateLimitHeaders).length > 0) {
            this.log(`Rate limit headers: ${JSON.stringify(rateLimitHeaders)}`, "info");
          }
          let logData = data;
          try {
            const jsonData = JSON.parse(data);
            if (jsonData.access_token)
              jsonData.access_token = "[REDACTED]";
            if (jsonData.refresh_token)
              jsonData.refresh_token = "[REDACTED]";
            logData = JSON.stringify(jsonData);
          } catch (e) {
          }
          if (res.statusCode === 429) {
            this.log(`RATE LIMIT EXCEEDED - Response body: ${logData}`, "error");
            const retryAfter = res.headers["retry-after"];
            if (retryAfter) {
              this.log(`X API says to retry after: ${retryAfter} seconds`, "info");
            }
            if (this.settings.bypassRateLimit) {
              this.log(`NOTICE: You have rate limit bypass enabled, but the X API is still enforcing its own rate limits. You're hitting the actual API rate limit.`, "error");
              this.log(`The client-side bypass only removes our rate limit handling, not X's server-side limits.`, "info");
            } else {
              this.log(`TIP: For debugging, you can temporarily bypass the client-side rate limit in Settings > Debug Settings.`, "info");
            }
          } else if (res.statusCode && res.statusCode >= 400) {
            this.log(`ERROR RESPONSE - Status ${res.statusCode}, body: ${logData}`, "error");
          } else {
            this.log(`Response body: ${logData.length > 500 ? logData.substring(0, 500) + "..." : logData}`, "debug");
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data
          });
        });
      });
      req.on("error", (error) => {
        this.log(`HTTPS request error: ${error.message}`, "error");
        const nodeError = error;
        if (nodeError.code === "ENOTFOUND" || nodeError.code === "ECONNREFUSED") {
          this.log("Connection issue: Cannot connect to the server. Check network and DNS.", "error");
        } else if (nodeError.code === "ETIMEDOUT") {
          this.log("Connection timed out: Server took too long to respond.", "error");
        } else if (nodeError.code === "ECONNRESET") {
          this.log("Connection reset: The connection was forcibly closed by the remote server.", "error");
        } else if (nodeError.code === "CERT_HAS_EXPIRED") {
          this.log("SSL error: The server certificate has expired or is invalid.", "error");
        }
        reject(error);
      });
      req.on("timeout", () => {
        this.log("Request timed out after 10 seconds", "error");
        req.destroy();
        reject(new Error("Request timed out"));
      });
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
  async exchangeAuthCodeForToken(code, callbackUrl) {
    this.log(`exchangeAuthCodeForToken: Starting with code: ${code.substring(0, 10)}... and callback URL: ${callbackUrl}`, "debug");
    if (!this.settings.clientId) {
      this.log("Client ID is missing for token exchange", "error");
      throw new Error("Client ID is required to exchange authorization code for token.");
    }
    if (!this.settings.codeVerifier) {
      this.log("Code verifier is missing for token exchange (PKCE)", "error");
      throw new Error("Code verifier is required for PKCE flow.");
    }
    try {
      const tokenUrl = "https://api.x.com/2/oauth2/token";
      const bodyParams = new URLSearchParams({
        "code": code,
        "grant_type": "authorization_code",
        "client_id": this.settings.clientId,
        "redirect_uri": callbackUrl,
        "code_verifier": this.settings.codeVerifier
      });
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
      this.log("Sending token exchange request using nodeHttpRequest", "debug");
      const response = await this.nodeHttpRequest(tokenUrl, options, bodyParams.toString());
      if (response.statusCode >= 200 && response.statusCode < 300) {
        try {
          const data = JSON.parse(response.body);
          this.log("Received token exchange response: successful", "debug");
          this.settings.oauth2AccessToken = data.access_token;
          this.settings.oauth2RefreshToken = data.refresh_token || "";
          this.settings.codeVerifier = "";
          await this.saveSettingsCallback();
          this.initializeClient();
          return true;
        } catch (parseError) {
          this.log(`Error parsing token response: ${parseError}`, "error");
          return false;
        }
      } else {
        this.log(`Token exchange failed with status ${response.statusCode}: ${response.body}`, "error");
        return false;
      }
    } catch (error) {
      this.log(`Error during token exchange: ${error}`, "error");
      return false;
    }
  }
  async refreshAccessToken(retryCount = 0, maxRetries = 1) {
    if (!this.settings.oauth2RefreshToken) {
      this.log("No refresh token available to refresh access token.", "info");
      return false;
    }
    if (!this.settings.clientId) {
      this.log("Client ID is missing for token refresh", "error");
      return false;
    }
    if (retryCount > maxRetries) {
      this.log(`Maximum retries (${maxRetries}) reached for token refresh`, "error");
      return false;
    }
    if (retryCount > 0) {
      const backoffMs = Math.pow(2, retryCount) * 1e3;
      this.log(`Applying backoff delay of ${backoffMs}ms before retry #${retryCount}`, "info");
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
    this.log("Attempting to refresh access token...", "debug");
    const tokenUrl = "https://api.x.com/2/oauth2/token";
    const bodyParams = new URLSearchParams({
      "refresh_token": this.settings.oauth2RefreshToken,
      "grant_type": "refresh_token",
      "client_id": this.settings.clientId
    });
    if (this.settings.clientSecret) {
      bodyParams.append("client_secret", this.settings.clientSecret);
    }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    try {
      this.log("Sending token refresh request using nodeHttpRequest", "debug");
      const response = await this.nodeHttpRequest(tokenUrl, options, bodyParams.toString());
      if (response.statusCode === 429) {
        this.log("Token refresh rate limited", "error");
        let waitTime = 15 * 60 * 1e3;
        if (response.headers["retry-after"]) {
          const retryAfterSecs = parseInt(response.headers["retry-after"], 10);
          if (!isNaN(retryAfterSecs)) {
            waitTime = retryAfterSecs * 1e3;
          }
        }
        try {
          const errorData = JSON.parse(response.body);
          this.log(`Token refresh response status: ${response.statusCode}`, "debug");
          this.log(`Token refresh response data: ${response.body}`, "debug");
          if (errorData.error_description && errorData.error_description.includes("wait")) {
            const minutesMatch = errorData.error_description.match(/wait (\d+) minutes/i);
            if (minutesMatch && minutesMatch[1]) {
              const waitMinutes = parseInt(minutesMatch[1], 10);
              if (!isNaN(waitMinutes)) {
                waitTime = waitMinutes * 60 * 1e3;
              }
            }
          }
        } catch (e) {
        }
        this.log(`Rate limited. Need to wait ${Math.ceil(waitTime / 1e3 / 60)} minutes before retrying.`, "error");
        return false;
      }
      if (response.statusCode >= 200 && response.statusCode < 300) {
        try {
          const data = JSON.parse(response.body);
          this.log("Received token refresh response: successful", "debug");
          this.settings.oauth2AccessToken = data.access_token;
          if (data.refresh_token) {
            this.settings.oauth2RefreshToken = data.refresh_token;
          }
          await this.saveSettingsCallback();
          this.initializeClient();
          return true;
        } catch (parseError) {
          this.log(`Error parsing refresh token response: ${parseError}`, "error");
          return false;
        }
      } else {
        this.log(`Token refresh failed with status ${response.statusCode}: ${response.body}`, "error");
        return false;
      }
    } catch (error) {
      this.log(`Error during token refresh: ${error}`, "error");
      return false;
    }
  }
  async revokeToken() {
    if (!this.settings.oauth2AccessToken) {
      this.log("No access token to revoke.", "info");
      return true;
    }
    if (!this.settings.clientId) {
      this.log("Client ID is missing for token revocation.", "error");
      return false;
    }
    this.log("Attempting to revoke access token...", "debug");
    const revokeUrl = "https://api.x.com/2/oauth2/revoke";
    const bodyParams = new URLSearchParams({
      "token": this.settings.oauth2AccessToken,
      "token_type_hint": "access_token",
      "client_id": this.settings.clientId
    });
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    if (this.settings.clientSecret) {
      options.headers["Authorization"] = "Basic " + this.safeBase64Encode(`${this.settings.clientId}:${this.settings.clientSecret}`);
    }
    try {
      this.log("Sending token revocation request using nodeHttpRequest", "debug");
      const response = await this.nodeHttpRequest(revokeUrl, options, bodyParams.toString());
      if (response.statusCode >= 200 && response.statusCode < 300) {
        this.log("Token successfully revoked.", "info");
      } else {
        this.log(`Error revoking token: ${response.statusCode} - ${response.body}`, "info");
      }
    } catch (error) {
      this.log(`Network or other error during token revocation: ${error}`, "error");
    } finally {
      this.settings.oauth2AccessToken = "";
      this.settings.oauth2RefreshToken = "";
      this.settings.codeVerifier = "";
      await this.saveSettingsCallback();
      this.client = null;
      this.log("Local tokens cleared after revocation attempt.", "info");
    }
    return true;
  }
  hasOAuth2Credentials() {
    return !!this.settings.oauth2AccessToken;
  }
  async testConnection() {
    var _a;
    try {
      if (this.isRateLimited()) {
        const timeElapsed = Date.now() - Math.max(this.lastApiCallTime, this.settings.lastSyncTime);
        const timeToWait = Math.ceil((this.apiRateLimitWindow - timeElapsed) / 1e3 / 60);
        this.log(`TEST CONNECTION: Cannot proceed - still in rate limit window. Please wait ${timeToWait} more minutes.`, "error");
        return false;
      }
      if (!this.client) {
        this.log("No Twitter client available, initializing...", "info");
        this.initializeClient();
        if (!this.client) {
          this.log("Failed to initialize Twitter client", "error");
          return false;
        }
      }
      this.log("API CALL: GET /2/users/me (test connection)", "info");
      await this.updateRateLimitTimestamp();
      const currentUser = await this.client.v2.me();
      this.log(`Connection test response: ${JSON.stringify(currentUser)}`, "info");
      return !!currentUser.data.id;
    } catch (error) {
      this.log(`Twitter API connection test failed: ${error}`, "error");
      const errorObj = error;
      if (errorObj.code === 429 || errorObj.errors && ((_a = errorObj.errors[0]) == null ? void 0 : _a.code) === 88) {
        this.log("TEST CONNECTION: Rate limit reached", "error");
        await this.updateRateLimitTimestamp();
        return false;
      }
      if (this.settings.oauth2RefreshToken && !this.isRateLimited()) {
        try {
          this.log("Trying to refresh the access token...", "info");
          await this.refreshAccessToken();
          if (this.client && !this.isRateLimited()) {
            this.log("API CALL: GET /2/users/me (retry after token refresh)", "info");
            await this.updateRateLimitTimestamp();
            const currentUser = await this.client.v2.me();
            return !!currentUser.data.id;
          } else {
            this.log("Not retrying after token refresh due to rate limit", "info");
          }
        } catch (refreshError) {
          this.log(`Failed to refresh access token: ${refreshError}`, "error");
        }
      }
      return false;
    }
  }
  isRateLimited() {
    if (this.settings.bypassRateLimit) {
      this.log(`\u26A0\uFE0F RATE LIMIT BYPASS: Rate limit check bypassed due to debug setting`, "info");
      return false;
    }
    const now = Date.now();
    const lastCallTime = this.lastApiCallTime || 0;
    const lastSyncTime = this.settings.lastSyncTime || 0;
    const lastRelevantTime = Math.max(lastCallTime, lastSyncTime);
    if (lastRelevantTime === 0) {
      this.log("No previous API calls detected, not rate limited", "debug");
      return false;
    }
    const timeElapsed = now - lastRelevantTime;
    const isLimited = timeElapsed < this.apiRateLimitWindow;
    if (isLimited) {
      const timeToWait = Math.ceil((this.apiRateLimitWindow - timeElapsed) / 1e3 / 60);
      this.log(`\u26A0\uFE0F RATE LIMITED: Need to wait ${timeToWait} more minutes before API call.`, "info");
      this.log(`Rate limit details: 
               Current time: ${new Date(now).toISOString()}
               Last API call: ${new Date(lastCallTime).toISOString()} 
               Last sync time: ${new Date(lastSyncTime).toISOString()}
               Most recent event: ${new Date(lastRelevantTime).toISOString()}
               Time elapsed: ${timeElapsed}ms
               Rate limit window: ${this.apiRateLimitWindow}ms (${this.apiRateLimitWindow / 1e3 / 60} minutes)
               Time remaining: ${this.apiRateLimitWindow - timeElapsed}ms
               Will be free at: ${new Date(lastRelevantTime + this.apiRateLimitWindow).toISOString()}`, "debug");
    } else {
      this.log(`Not rate limited. Last API call was ${Math.floor(timeElapsed / 1e3 / 60)} minutes ago.`, "debug");
    }
    return isLimited;
  }
  async updateRateLimitTimestamp() {
    const now = Date.now();
    this.lastApiCallTime = now;
    this.log(`Updated API rate limit timestamp to ${new Date(this.lastApiCallTime).toISOString()}`, "debug");
    this.settings.lastSyncTime = now;
    try {
      await this.saveSettingsCallback();
      this.log("Saved rate limit info to settings file", "debug");
    } catch (error) {
      this.log(`Error saving rate limit info: ${error}`, "error");
    }
  }
  async fetchBookmarks(lastSyncTimestamp) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this.apiCallsInProgress) {
      this.log("API call already in progress, aborting", "info");
      throw new Error("Another API call is already in progress. Please wait for it to complete.");
    }
    if (this.isRateLimited()) {
      const timeElapsed = Date.now() - Math.max(this.lastApiCallTime, this.settings.lastSyncTime);
      const timeToWait = Math.ceil((this.apiRateLimitWindow - timeElapsed) / 1e3 / 60);
      const nextAllowedTime = new Date(Math.max(this.lastApiCallTime, this.settings.lastSyncTime) + this.apiRateLimitWindow);
      this.log(`\u26D4 RATE LIMIT CHECK: Cannot proceed with API call - still in rate limit window.`, "error");
      this.log(`Next allowed time: ${nextAllowedTime.toISOString()} (in ${timeToWait} minutes)`, "info");
      throw new Error(`X API rate limit not reset yet. Please wait approximately ${timeToWait} more minutes before trying again.`);
    }
    this.apiCallsInProgress = true;
    try {
      if (!this.client) {
        this.log("Twitter client not initialized, attempting to initialize now", "info");
        this.initializeClient();
        if (!this.client) {
          this.log("Failed to initialize Twitter client", "error");
          throw new Error("Twitter client not initialized. Check your API credentials or authorize with X.");
        }
      }
      this.log(`STARTING BOOKMARKS SYNC: Retrieving user information first`, "info");
      this.log("API CALL: GET /2/users/me (to get user ID)", "info");
      await this.updateRateLimitTimestamp();
      this.log(`API timestamp updated to prevent rapid consecutive calls`, "debug");
      let currentUser;
      try {
        currentUser = await this.client.v2.me();
        this.log(`API RESPONSE: User ID ${currentUser.data.id} retrieved successfully`, "info");
      } catch (userError) {
        this.log(`Error getting current user: ${userError}`, "error");
        if (userError.code === 429 || userError.errors && ((_a = userError.errors[0]) == null ? void 0 : _a.code) === 88) {
          this.log(`RATE LIMIT REACHED on GET /2/users/me call`, "error");
          const resetTimeRaw = (_b = userError.rateLimit) == null ? void 0 : _b.reset;
          let waitTimeMsg = "15 minutes";
          if (resetTimeRaw) {
            const resetTime = new Date(resetTimeRaw * 1e3);
            const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1e3 * 60));
            waitTimeMsg = `${waitMinutes} minutes (until ${resetTime.toISOString()})`;
          }
          throw new Error(`X API rate limit exceeded on user info request. Please wait ${waitTimeMsg} before trying again.`);
        }
        throw userError;
      }
      const userId = currentUser.data.id;
      const allBookmarks = [];
      const MAX_REQUESTS = 1;
      let requestCount = 0;
      let paginationToken = void 0;
      if (!this.settings.initialSyncComplete && this.settings.nextPaginationToken) {
        paginationToken = this.settings.nextPaginationToken;
        this.log(`Continuing bookmarks sync from page ${this.settings.lastSyncPage + 1} with saved pagination token`, "info");
      } else if (this.settings.initialSyncComplete) {
        this.log(`Initial sync complete, checking for new bookmarks since ${new Date(lastSyncTimestamp).toISOString()}`, "info");
      } else {
        this.log("Starting initial bookmark sync", "info");
      }
      this.log(`\u26A0\uFE0F RATE LIMIT INFO: X API allows 1 request per 15 minutes per user.`, "info");
      let madeRequest = false;
      while (requestCount < MAX_REQUESTS) {
        requestCount++;
        madeRequest = true;
        this.log(`API CALL: GET /2/users/${userId}/bookmarks (request ${requestCount}/${MAX_REQUESTS})`, "info");
        this.log(`API parameters: expansions=[author_id,attachments.media_keys], user.fields=[name,username], media.fields=[url,preview_image_url], tweet.fields=[created_at], max_results=100${paginationToken ? `, pagination_token=${paginationToken.substring(0, 10)}...` : ""}`, "debug");
        await this.updateRateLimitTimestamp();
        try {
          const bookmarksResponse = await this.client.v2.bookmarks({
            expansions: ["author_id", "attachments.media_keys"],
            "user.fields": ["name", "username"],
            "media.fields": ["url", "preview_image_url"],
            "tweet.fields": ["created_at"],
            max_results: 100,
            pagination_token: paginationToken
          });
          this.log(`API RESPONSE: Received bookmarks response with status OK, found ${((_c = bookmarksResponse.data.data) == null ? void 0 : _c.length) || 0} bookmark(s)`, "info");
          const bookmarks = this.processBookmarksPage(bookmarksResponse, this.settings.initialSyncComplete ? lastSyncTimestamp : 0);
          allBookmarks.push(...bookmarks);
          this.settings.lastSyncPage++;
          if (bookmarksResponse.rateLimit) {
            this.log(`RATE LIMIT HEADERS: Remaining=${bookmarksResponse.rateLimit.remaining}/${bookmarksResponse.rateLimit.limit}, Reset=${new Date(bookmarksResponse.rateLimit.reset * 1e3).toISOString()}`, "info");
          }
          if (bookmarksResponse.meta && bookmarksResponse.meta.next_token) {
            this.settings.nextPaginationToken = bookmarksResponse.meta.next_token;
            this.log(`PAGINATION: Found next pagination token: ${this.settings.nextPaginationToken.substring(0, 10)}...`, "debug");
            this.log(`\u26A0\uFE0F MORE DATA AVAILABLE: There are more bookmarks available. You'll need to sync again in 15 minutes to continue.`, "info");
            this.settings.initialSyncComplete = false;
            await this.saveSettingsCallback();
            break;
          } else {
            this.settings.nextPaginationToken = "";
            this.settings.initialSyncComplete = true;
            this.log("SYNC COMPLETE: No more pages available, reached the end of all bookmarks", "info");
            await this.saveSettingsCallback();
            break;
          }
        } catch (bookmarkError) {
          this.log(`Error fetching bookmarks: ${bookmarkError}`, "error");
          if (bookmarkError.code === 429 || bookmarkError.errors && ((_d = bookmarkError.errors[0]) == null ? void 0 : _d.code) === 88) {
            this.log(`RATE LIMIT REACHED on GET /2/users/${userId}/bookmarks call`, "error");
            if (bookmarkError.rateLimit) {
              const resetTime = new Date(bookmarkError.rateLimit.reset * 1e3);
              this.log(`Rate limit reset time: ${resetTime.toISOString()}`, "info");
            }
            await this.updateRateLimitTimestamp();
            throw new Error(`X API rate limit exceeded. Please try again in 15 minutes.`);
          }
          throw bookmarkError;
        }
      }
      if (!madeRequest) {
        this.log("No bookmarks request made in this session due to rate limits", "info");
      }
      this.log(`SYNC SUMMARY: Retrieved ${allBookmarks.length} bookmarks in this sync session`, "info");
      return allBookmarks;
    } catch (error) {
      this.log(`ERROR FETCHING TWITTER BOOKMARKS: ${error}`, "error");
      const errorObj = error;
      if (errorObj.code || errorObj.errors && errorObj.errors.length > 0) {
        this.log(`API error details: ${JSON.stringify({
          code: errorObj.code,
          errors: errorObj.errors,
          status: errorObj.status,
          rateLimit: errorObj.rateLimit
        }, null, 2)}`, "error");
      }
      if (errorObj.code === 429 || errorObj.errors && ((_e = errorObj.errors[0]) == null ? void 0 : _e.code) === 88) {
        const resetTimeHeader = (_f = errorObj.rateLimit) == null ? void 0 : _f.reset;
        let waitMessage = "X API rate limit exceeded. Please try again in 15 minutes.";
        if (resetTimeHeader) {
          const resetTime = new Date(resetTimeHeader * 1e3);
          const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1e3 * 60));
          waitMessage = `X API rate limit exceeded. Please try again in ${waitMinutes} minutes.`;
        }
        await this.updateRateLimitTimestamp();
        if (!this.settings.bypassRateLimit) {
          this.log(`TIP: For debugging, you can temporarily bypass the client-side rate limit in Settings > Debug Settings. This won't prevent X API 429 errors but will bypass the waiting period between requests.`, "info");
        } else {
          this.log(`NOTICE: You have rate limit bypass enabled, but received a 429 error from X API. This confirms you are hitting the actual API rate limit.`, "error");
        }
        this.log(waitMessage, "error");
        throw new Error(waitMessage);
      }
      if (this.settings.oauth2RefreshToken && !this.isRateLimited() && (errorObj.code === 401 || errorObj.errors && ((_g = errorObj.errors[0]) == null ? void 0 : _g.code) === 32 || /unauthorized/i.test(String(error)))) {
        this.log("Token may have expired, attempting to refresh once...", "info");
        try {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            this.log("Successfully refreshed token, retrying bookmark fetch", "info");
            this.apiCallsInProgress = false;
            throw new Error("Authentication refreshed. Please try syncing again.");
          } else {
            this.log("Failed to refresh token", "error");
          }
        } catch (refreshError) {
          this.log(`Error refreshing token: ${refreshError}`, "error");
          throw new Error(`Authentication error: ${refreshError.message}`);
        }
      }
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    } finally {
      this.apiCallsInProgress = false;
    }
  }
  processBookmarksPage(bookmarksResponse, lastSyncTimestamp) {
    var _a, _b, _c, _d;
    const bookmarks = [];
    for (const tweet of bookmarksResponse.data.data || []) {
      const author = (_b = (_a = bookmarksResponse.data.includes) == null ? void 0 : _a.users) == null ? void 0 : _b.find((user) => user.id === tweet.author_id);
      const mediaKeys = ((_c = tweet.attachments) == null ? void 0 : _c.media_keys) || [];
      const mediaItems = ((_d = bookmarksResponse.data.includes) == null ? void 0 : _d.media) || [];
      const mediaUrls = mediaKeys.map((key) => {
        const media = mediaItems.find((item) => item.media_key === key);
        return (media == null ? void 0 : media.url) || (media == null ? void 0 : media.preview_image_url) || null;
      }).filter((url) => url !== null);
      const tweetCreatedAt = new Date(tweet.created_at);
      if (lastSyncTimestamp > 0 && tweetCreatedAt.getTime() <= lastSyncTimestamp) {
        continue;
      }
      bookmarks.push({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweetCreatedAt,
        authorId: tweet.author_id,
        authorUsername: (author == null ? void 0 : author.username) || "unknown",
        authorName: (author == null ? void 0 : author.name) || "Unknown User",
        mediaUrls,
        tweetUrl: `https://twitter.com/${author == null ? void 0 : author.username}/status/${tweet.id}`
      });
    }
    return bookmarks;
  }
  async checkRateLimitStatus() {
    if (this.settings.bypassRateLimit) {
      this.log(`\u26A0\uFE0F RATE LIMIT BYPASS: Rate limit check bypassed due to debug setting`, "info");
      return false;
    }
    const now = Date.now();
    const lastCallTime = this.lastApiCallTime || 0;
    const lastSyncTime = this.settings.lastSyncTime || 0;
    const lastRelevantTime = Math.max(lastCallTime, lastSyncTime);
    if (lastRelevantTime === 0) {
      this.log("No previous API calls detected, not rate limited", "debug");
      return false;
    }
    const timeElapsed = now - lastRelevantTime;
    const isLimited = timeElapsed < this.apiRateLimitWindow;
    if (isLimited) {
      const timeToWait = Math.ceil((this.apiRateLimitWindow - timeElapsed) / 1e3 / 60);
      const nextAllowedTime = new Date(lastRelevantTime + this.apiRateLimitWindow);
      const errorMessage = `X API rate limit active. Please wait approximately ${timeToWait} more minutes (until ${nextAllowedTime.toLocaleTimeString()}).`;
      this.log(`RATE LIMIT CHECK: ${errorMessage}`, "info");
      throw new Error(errorMessage);
    }
    this.log("Rate limit check passed - API is available", "debug");
    return false;
  }
};

// src/core/bookmark-processor.ts
var import_obsidian = __toModule(require("obsidian"));
var BookmarkProcessor = class {
  constructor(app, settings, bookmarkStorage) {
    this.app = app;
    this.settings = settings;
    this.bookmarkStorage = bookmarkStorage;
  }
  async processBookmarks(bookmarks) {
    if (!bookmarks || bookmarks.length === 0) {
      return;
    }
    await this.ensureTargetFolderExists();
    if (this.settings.storageMethod === "single") {
      await this.processSingleFileBookmarks(bookmarks);
    } else {
      await this.processSeparateFileBookmarks(bookmarks);
    }
  }
  async processSeparateFileBookmarks(bookmarks) {
    for (const bookmark of bookmarks) {
      if (await this.bookmarkStorage.isBookmarkProcessed(bookmark.id)) {
        continue;
      }
      const fileContent = this.generateMarkdownContent(bookmark);
      const fileName = this.generateFileName(bookmark);
      await this.saveToFile(fileName, fileContent);
      await this.bookmarkStorage.markBookmarkAsProcessed(bookmark.id);
    }
  }
  async processSingleFileBookmarks(bookmarks) {
    try {
      const fileName = this.settings.singleFileName || "twitter-bookmarks.md";
      const normalizedFileName = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
      await this.ensureTargetFolderExists();
      const folderPath = (0, import_obsidian.normalizePath)(this.settings.targetFolder);
      const filePath = (0, import_obsidian.normalizePath)(`${folderPath}/${normalizedFileName}`);
      console.log(`[Bookmark Bridge] Processing bookmarks into single file: ${filePath}`);
      let existingContent = "";
      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        console.log(`[Bookmark Bridge] Single file exists, reading existing content`);
        existingContent = await this.readFile(filePath);
        console.log(`[Bookmark Bridge] Read ${existingContent.length} characters from existing file`);
      } else {
        console.log(`[Bookmark Bridge] Single file does not exist, creating new file with header`);
        existingContent = `# Twitter Bookmarks

A collection of your bookmarked tweets from Twitter/X.

`;
      }
      let newBookmarksAdded = false;
      let processedCount = 0;
      console.log(`[Bookmark Bridge] Processing ${bookmarks.length} bookmarks for single file storage`);
      for (const bookmark of bookmarks) {
        try {
          if (await this.bookmarkStorage.isBookmarkProcessed(bookmark.id)) {
            console.log(`[Bookmark Bridge] Skipping already processed bookmark: ${bookmark.id}`);
            continue;
          }
          console.log(`[Bookmark Bridge] Generating content for bookmark: ${bookmark.id}`);
          const bookmarkContent = this.generateSingleFileBookmarkContent(bookmark);
          existingContent = `${existingContent}
---

${bookmarkContent}`;
          await this.bookmarkStorage.markBookmarkAsProcessed(bookmark.id);
          newBookmarksAdded = true;
          processedCount++;
        } catch (bookmarkError) {
          console.error(`[Bookmark Bridge] Error processing bookmark ${bookmark.id}:`, bookmarkError);
        }
      }
      if (newBookmarksAdded) {
        console.log(`[Bookmark Bridge] Saving ${processedCount} new bookmarks to single file`);
        try {
          const savedFile = await this.saveToFile(filePath, existingContent);
          console.log(`[Bookmark Bridge] Successfully saved to file: ${savedFile.path}`);
        } catch (saveError) {
          console.error(`[Bookmark Bridge] Error saving single file:`, saveError);
          throw saveError;
        }
      } else {
        console.log(`[Bookmark Bridge] No new bookmarks to add to single file`);
      }
    } catch (error) {
      console.error(`[Bookmark Bridge] Error in processSingleFileBookmarks:`, error);
      throw error;
    }
  }
  generateSingleFileBookmarkContent(bookmark) {
    if (this.settings.useCustomTemplate) {
      return this.renderTemplate(this.settings.template, bookmark);
    }
    const date = bookmark.createdAt.toLocaleDateString();
    const time = bookmark.createdAt.toLocaleTimeString();
    let content = `## Tweet by @${bookmark.authorUsername} - ${date} ${time}

`;
    content += `${bookmark.text}

`;
    if (bookmark.mediaUrls.length > 0) {
      content += `### Media

`;
      for (const mediaUrl of bookmark.mediaUrls) {
        content += `![](${mediaUrl})

`;
      }
    }
    content += `[View on Twitter](${bookmark.tweetUrl})`;
    return content;
  }
  renderTemplate(template, bookmark) {
    const date = bookmark.createdAt.toLocaleDateString();
    const time = bookmark.createdAt.toLocaleTimeString();
    let content = template.replace(/{{id}}/g, bookmark.id).replace(/{{text}}/g, bookmark.text).replace(/{{authorUsername}}/g, bookmark.authorUsername).replace(/{{authorName}}/g, bookmark.authorName).replace(/{{authorId}}/g, bookmark.authorId).replace(/{{date}}/g, date).replace(/{{time}}/g, time).replace(/{{tweetUrl}}/g, bookmark.tweetUrl);
    const hasMedia = bookmark.mediaUrls.length > 0;
    content = this.processConditionalBlock(content, "hasMedia", hasMedia);
    content = this.processArrayBlock(content, "mediaUrls", bookmark.mediaUrls);
    return content;
  }
  processConditionalBlock(content, blockName, condition) {
    const blockRegex = new RegExp(`{{#${blockName}}}([\\s\\S]*?){{/${blockName}}}`, "g");
    if (condition) {
      return content.replace(blockRegex, (match, blockContent) => blockContent);
    } else {
      return content.replace(blockRegex, "");
    }
  }
  processArrayBlock(content, blockName, array) {
    const blockRegex = new RegExp(`{{#${blockName}}}([\\s\\S]*?){{/${blockName}}}`, "g");
    return content.replace(blockRegex, (match, blockContent) => {
      if (array.length === 0)
        return "";
      return array.map((item) => blockContent.replace(/{{\.}}/g, item)).join("");
    });
  }
  async ensureTargetFolderExists() {
    const folderPath = (0, import_obsidian.normalizePath)(this.settings.targetFolder);
    if (!await this.app.vault.adapter.exists(folderPath)) {
      await this.app.vault.createFolder(folderPath);
    }
  }
  generateMarkdownContent(bookmark) {
    if (this.settings.useCustomTemplate) {
      return this.renderTemplate(this.settings.template, bookmark);
    }
    const date = bookmark.createdAt.toLocaleDateString();
    const time = bookmark.createdAt.toLocaleTimeString();
    let content = `---
tweet_id: "${bookmark.id}"
author: "@${bookmark.authorUsername} (${bookmark.authorName})"
date: "${date} ${time}"
---

# Tweet by @${bookmark.authorUsername}

${bookmark.text}

`;
    if (bookmark.mediaUrls.length > 0) {
      content += `## Media

`;
      for (const mediaUrl of bookmark.mediaUrls) {
        content += `![](${mediaUrl})

`;
      }
    }
    content += `[View on Twitter](${bookmark.tweetUrl})`;
    return content;
  }
  generateFileName(bookmark) {
    const sanitizedText = bookmark.text.replace(/[^\w\s]/gi, "").trim().replace(/\s+/g, "-").substring(0, 30);
    return `${this.settings.targetFolder}/Tweet-${bookmark.id}-${sanitizedText}.md`;
  }
  async saveToFile(filePath, content) {
    try {
      const normalizedPath = (0, import_obsidian.normalizePath)(filePath);
      console.log(`[Bookmark Bridge] Saving to file: ${normalizedPath}`);
      if (await this.app.vault.adapter.exists(normalizedPath)) {
        console.log(`[Bookmark Bridge] File exists, updating content`);
        const file = this.app.vault.getAbstractFileByPath(normalizedPath);
        if (!file) {
          console.error(`[Bookmark Bridge] File exists but couldn't be retrieved as TFile: ${normalizedPath}`);
          throw new Error(`File exists but couldn't be retrieved: ${normalizedPath}`);
        }
        await this.app.vault.modify(file, content);
        return file;
      } else {
        console.log(`[Bookmark Bridge] File doesn't exist, creating new file`);
        const lastSlashIndex = normalizedPath.lastIndexOf("/");
        if (lastSlashIndex > 0) {
          const dirPath = normalizedPath.substring(0, lastSlashIndex);
          await this.ensureFolderExists(dirPath);
        }
        return await this.app.vault.create(normalizedPath, content);
      }
    } catch (error) {
      console.error(`[Bookmark Bridge] Error in saveToFile:`, error);
      throw error;
    }
  }
  async ensureFolderExists(folderPath) {
    const normalizedPath = (0, import_obsidian.normalizePath)(folderPath);
    console.log(`[Bookmark Bridge] Ensuring folder exists: ${normalizedPath}`);
    if (!await this.app.vault.adapter.exists(normalizedPath)) {
      console.log(`[Bookmark Bridge] Folder doesn't exist, creating: ${normalizedPath}`);
      await this.app.vault.createFolder(normalizedPath);
    } else {
      console.log(`[Bookmark Bridge] Folder already exists: ${normalizedPath}`);
    }
  }
  async fileExists(filePath) {
    const normalizedPath = (0, import_obsidian.normalizePath)(filePath);
    const exists = await this.app.vault.adapter.exists(normalizedPath);
    console.log(`[Bookmark Bridge] Checking if file exists: ${normalizedPath} - ${exists ? "Yes" : "No"}`);
    return exists;
  }
  async readFile(filePath) {
    const normalizedPath = (0, import_obsidian.normalizePath)(filePath);
    console.log(`[Bookmark Bridge] Reading file: ${normalizedPath}`);
    if (await this.app.vault.adapter.exists(normalizedPath)) {
      try {
        const content = await this.app.vault.adapter.read(normalizedPath);
        console.log(`[Bookmark Bridge] Successfully read ${content.length} characters from file`);
        return content;
      } catch (error) {
        console.error(`[Bookmark Bridge] Error reading file: ${normalizedPath}`, error);
        throw error;
      }
    }
    console.log(`[Bookmark Bridge] File not found for reading: ${normalizedPath}`);
    return "";
  }
};

// src/core/bookmark-storage.ts
var BookmarkStorage = class {
  constructor(app) {
    this.processedBookmarks = {};
    this.bookmarkRecords = {};
    this.STORAGE_KEY = "bookmark-bridge-processed";
    this.RECORDS_KEY = "bookmark-bridge-records";
    this.dataLoaded = false;
    this.app = app;
    this.loadData();
  }
  async loadData() {
    if (this.dataLoaded)
      return;
    try {
      const processedBookmarksJson = localStorage.getItem(this.STORAGE_KEY);
      const bookmarkRecordsJson = localStorage.getItem(this.RECORDS_KEY);
      if (processedBookmarksJson) {
        this.processedBookmarks = JSON.parse(processedBookmarksJson);
      }
      if (bookmarkRecordsJson) {
        const recordsData = JSON.parse(bookmarkRecordsJson);
        this.bookmarkRecords = {};
        for (const id in recordsData) {
          const record = recordsData[id];
          this.bookmarkRecords[id] = {
            ...record,
            importDate: new Date(record.importDate)
          };
        }
      }
      this.dataLoaded = true;
    } catch (error) {
      console.error("Failed to load bookmark data:", error);
      this.processedBookmarks = {};
      this.bookmarkRecords = {};
    }
  }
  async saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.processedBookmarks));
      localStorage.setItem(this.RECORDS_KEY, JSON.stringify(this.bookmarkRecords));
    } catch (error) {
      console.error("Failed to save bookmark data:", error);
    }
  }
  async isBookmarkProcessed(bookmarkId) {
    await this.loadData();
    return !!this.processedBookmarks[bookmarkId];
  }
  async markBookmarkAsProcessed(bookmarkId) {
    this.processedBookmarks[bookmarkId] = Date.now();
    await this.saveData();
  }
  async getProcessedBookmarkIds() {
    await this.loadData();
    return Object.keys(this.processedBookmarks);
  }
  async clearProcessedBookmarks() {
    this.processedBookmarks = {};
    await this.saveData();
  }
  async getBookmarkById(tweetId) {
    await this.loadData();
    return this.bookmarkRecords[tweetId] || null;
  }
  async saveBookmark(record) {
    this.bookmarkRecords[record.tweetId] = record;
    this.processedBookmarks[record.tweetId] = record.importDate.getTime();
    await this.saveData();
  }
  async getAllBookmarks() {
    await this.loadData();
    return Object.values(this.bookmarkRecords);
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  clientId: "",
  clientSecret: "",
  oauth2AccessToken: "",
  oauth2RefreshToken: "",
  codeVerifier: "",
  storageMethod: "separate",
  targetFolder: "Twitter Bookmarks",
  singleFileName: "twitter-bookmarks.md",
  lastSyncTimestamp: 0,
  logFile: "",
  useCustomTemplate: false,
  template: `---
tweet_id: "{{id}}"
author: "@{{authorUsername}} ({{authorName}})"
date: "{{date}} {{time}}"
---

# Tweet by @{{authorUsername}}

{{text}}

{{#hasMedia}}
## Media

{{#mediaUrls}}
![]({{.}})

{{/mediaUrls}}
{{/hasMedia}}

[View on Twitter]({{tweetUrl}})`,
  nextPaginationToken: "",
  initialSyncComplete: false,
  lastSyncPage: 0,
  lastSyncTime: 0,
  autoSync: true,
  syncInProgress: false,
  bypassRateLimit: false
};
var BookmarkBridgePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.syncTimer = null;
    this.authState = null;
    this.currentCodeVerifier = null;
    this.isSyncCooldown = false;
    this.nextAllowedSyncTime = 0;
  }
  async onload() {
    await this.loadSettings();
    this.twitterService = new TwitterService(this.settings, this.saveSettings.bind(this));
    this.bookmarkStorage = new BookmarkStorage(this.app);
    this.bookmarkProcessor = new BookmarkProcessor(this.app, this.settings, this.bookmarkStorage);
    if (!this.settings.logFile) {
      const basePath = this.app.vault.adapter.basePath || "";
      this.settings.logFile = `${basePath}/.obsidian/plugins/bookmark-bridge/bookmark-bridge-log.txt`;
      await this.saveSettings();
      this.twitterService.log(`Setting log file path to: ${this.settings.logFile}`, "info");
    }
    this.logOAuthSetupInstructions();
    this.registerProtocolHandlers();
    const ribbonIconEl = this.addRibbonIcon("bookmark", "Bookmark Bridge", async () => {
      await this.syncBookmarks();
    });
    ribbonIconEl.addClass("bookmark-bridge-ribbon-icon");
    this.addCommand({
      id: "sync-twitter-bookmarks",
      name: "Sync Twitter Bookmarks",
      callback: async () => {
        await this.syncBookmarks();
      }
    });
    this.addCommand({
      id: "test-protocol-handler",
      name: "Test Protocol Handler (Debug)",
      callback: () => {
        const testState = this.authState || this.twitterService.generateRandomString(32);
        if (!this.authState)
          this.authState = testState;
        const testCode = this.twitterService.generateRandomString(20);
        const testUrl = `obsidian://bookmark-bridge/callback?code=${testCode}&state=${testState}`;
        this.twitterService.log(`TEST: Opening test URL to check protocol handler: ${testUrl}`, "info");
        window.open(testUrl);
        new import_obsidian2.Notice("Opened test protocol URL. Check logs to see if handler was triggered.");
      }
    });
    this.addSettingTab(new BookmarkBridgeSettingTab(this.app, this));
    this.twitterService.log(`Plugin loaded. Storage method: ${this.settings.storageMethod}, Single file: ${this.settings.singleFileName}`, "info");
    if (this.settings.autoSync) {
      this.startAutoSync();
    }
  }
  startAutoSync() {
    this.twitterService.log("Starting automatic sync system", "info");
    if (this.isSyncCooldown || this.settings.syncInProgress) {
      const reason = this.isSyncCooldown ? "sync cooldown active" : "sync already in progress";
      this.twitterService.log(`Not starting auto-sync: ${reason}`, "info");
      return;
    }
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    this.checkAndScheduleSync();
  }
  isInCooldown() {
    const now = Date.now();
    const cooldown = now < this.nextAllowedSyncTime;
    if (cooldown) {
      const waitSeconds = Math.ceil((this.nextAllowedSyncTime - now) / 1e3);
      this.twitterService.log(`In cooldown period. Need to wait ${waitSeconds} seconds before next sync.`, "debug");
    }
    return cooldown;
  }
  setCooldown(durationMs) {
    this.isSyncCooldown = true;
    this.nextAllowedSyncTime = Date.now() + durationMs;
    const cooldownMinutes = Math.ceil(durationMs / 1e3 / 60);
    this.twitterService.log(`Setting sync cooldown for ${cooldownMinutes} minutes`, "info");
    setTimeout(() => {
      this.twitterService.log("Sync cooldown period expired", "info");
      this.isSyncCooldown = false;
    }, durationMs);
  }
  async checkAndScheduleSync() {
    if (!this.validateSettings(false)) {
      this.twitterService.log("Cannot start auto-sync: missing required settings", "error");
      return;
    }
    if (this.settings.syncInProgress || !this.settings.bypassRateLimit && this.isInCooldown()) {
      const reason = this.settings.syncInProgress ? "sync in progress" : "in cooldown period";
      this.twitterService.log(`Not scheduling sync: ${reason}`, "info");
      return;
    }
    if (this.settings.bypassRateLimit) {
      this.twitterService.log(`\u26A0\uFE0F DEBUG: Bypassing rate limit window for scheduling due to debug setting`, "info");
    }
    const now = Date.now();
    const timeElapsed = now - this.settings.lastSyncTime;
    const RATE_LIMIT_WINDOW = 15 * 60 * 1e3;
    if (!this.settings.initialSyncComplete) {
      if (this.settings.bypassRateLimit || this.settings.lastSyncTime === 0 || timeElapsed >= RATE_LIMIT_WINDOW) {
        this.twitterService.log(`Auto-starting sync ${this.settings.lastSyncPage > 0 ? "continuation" : "initial"}`, "info");
        await this.syncBookmarks(true);
      } else {
        const timeToWait = RATE_LIMIT_WINDOW - timeElapsed;
        const minutesToWait = Math.ceil(timeToWait / 1e3 / 60);
        this.twitterService.log(`Rate limit not reset yet, scheduling next auto-sync in ${minutesToWait} minutes`, "info");
        this.settings.syncInProgress = false;
        await this.saveSettings();
        this.setCooldown(timeToWait);
        if (this.syncTimer) {
          clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(() => {
          this.twitterService.log("Auto-sync timer triggered after rate limit window", "info");
          this.syncBookmarks(true);
        }, timeToWait);
      }
    } else if (this.settings.autoSync) {
      const CHECK_INTERVAL = this.settings.bypassRateLimit ? 1 * 60 * 1e3 : 60 * 60 * 1e3;
      const timeDesc = this.settings.bypassRateLimit ? "1 minute (debug mode)" : "1 hour";
      this.twitterService.log(`Initial sync complete, scheduling routine check in ${timeDesc}`, "info");
      if (!this.settings.bypassRateLimit) {
        this.setCooldown(30 * 1e3);
      }
      if (this.syncTimer) {
        clearTimeout(this.syncTimer);
      }
      this.syncTimer = setTimeout(() => {
        this.twitterService.log("Routine sync check triggered", "info");
        this.syncBookmarks(true);
      }, CHECK_INTERVAL);
    }
  }
  async syncBookmarks(isAutoSync = false) {
    if (!this.validateSettings(!isAutoSync)) {
      return;
    }
    if (!this.settings.bypassRateLimit && this.isInCooldown()) {
      const waitTimeMs = this.nextAllowedSyncTime - Date.now();
      const waitMinutes = Math.ceil(waitTimeMs / 1e3 / 60);
      const message = `Rate limit cooldown active. Please wait approximately ${waitMinutes} more minutes before syncing.`;
      this.twitterService.log(message, "info");
      if (!isAutoSync) {
        new import_obsidian2.Notice(message, 5e3);
      }
      return;
    }
    if (this.settings.bypassRateLimit) {
      this.twitterService.log(`\u26A0\uFE0F DEBUG: Bypassing rate limit cooldown check due to debug setting`, "info");
    }
    if (!this.settings.bypassRateLimit) {
      try {
        const isLimited = await this.twitterService.checkRateLimitStatus();
        if (isLimited) {
          this.twitterService.log("Rate limited according to Twitter service, aborting sync", "info");
          if (!isAutoSync) {
            new import_obsidian2.Notice("Twitter API rate limit in effect. Please try again later.", 5e3);
          }
          return;
        }
      } catch (error) {
        const errorMessage = error.message;
        this.twitterService.log(`Rate limit check error: ${errorMessage}`, "error");
        if (!isAutoSync) {
          new import_obsidian2.Notice(`Cannot sync: ${errorMessage}`, 5e3);
        }
        return;
      }
    }
    if (this.settings.syncInProgress) {
      this.twitterService.log("Sync already in progress, not starting a new one", "info");
      if (!isAutoSync) {
        new import_obsidian2.Notice("A sync is already in progress. Please wait for it to complete.");
      }
      return;
    }
    this.settings.syncInProgress = true;
    await this.saveSettings();
    try {
      let notice = null;
      if (!isAutoSync) {
        notice = new import_obsidian2.Notice("Syncing Twitter bookmarks...", 0);
      }
      this.twitterService.log(`Starting bookmark sync. Storage method: ${this.settings.storageMethod}, Auto: ${isAutoSync}`, "info");
      if (this.settings.storageMethod === "single") {
        this.twitterService.log(`Using single file mode with file: ${this.settings.singleFileName}`, "info");
      }
      try {
        const bookmarks = await this.twitterService.fetchBookmarks(this.settings.lastSyncTimestamp);
        if (bookmarks.length === 0) {
          this.twitterService.log(`No new bookmarks found`, "info");
          if (notice) {
            notice.setMessage("No new bookmarks found.");
            setTimeout(() => notice == null ? void 0 : notice.hide(), 3e3);
          }
          this.setCooldown(60 * 1e3);
          if (isAutoSync) {
            this.settings.syncInProgress = false;
            await this.saveSettings();
            setTimeout(() => this.checkAndScheduleSync(), 1e3);
          }
          return;
        }
        this.twitterService.log(`Retrieved ${bookmarks.length} bookmarks, processing...`, "info");
        try {
          await this.bookmarkProcessor.processBookmarks(bookmarks);
          this.twitterService.log(`Successfully processed ${bookmarks.length} bookmarks`, "info");
        } catch (processingError) {
          this.twitterService.log(`Error processing bookmarks: ${processingError.message}`, "error");
          throw new Error(`Error processing bookmarks: ${processingError.message}`);
        }
        if (this.settings.initialSyncComplete) {
          this.settings.lastSyncTimestamp = Date.now();
          this.twitterService.log(`Updated last sync timestamp to ${new Date(this.settings.lastSyncTimestamp).toISOString()}`, "info");
        }
        this.settings.syncInProgress = false;
        await this.saveSettings();
        if (notice) {
          if (this.settings.initialSyncComplete) {
            notice.setMessage(`Successfully synced ${bookmarks.length} bookmark(s).`);
          } else {
            notice.setMessage(`Synced ${bookmarks.length} bookmark(s). More bookmarks available - continuing automatic sync.`);
          }
          setTimeout(() => notice == null ? void 0 : notice.hide(), 5e3);
        }
        const cooldownTime = 15 * 60 * 1e3;
        this.setCooldown(cooldownTime);
        if (isAutoSync) {
          setTimeout(() => this.checkAndScheduleSync(), 2e3);
        }
      } catch (fetchError) {
        let errorMessage = fetchError.message;
        this.twitterService.log(`Error fetching bookmarks: ${errorMessage}`, "error");
        if (errorMessage.includes("Authentication refreshed")) {
          this.twitterService.log("Access token refreshed successfully, scheduling retry with cooldown", "info");
          const cooldownTime2 = 30 * 1e3;
          this.setCooldown(cooldownTime2);
          if (notice) {
            notice.setMessage("Authentication renewed. Will retry shortly.");
            setTimeout(() => notice == null ? void 0 : notice.hide(), 5e3);
          }
          if (isAutoSync) {
            setTimeout(() => {
              this.twitterService.log("Retrying sync after token refresh...", "info");
              this.syncBookmarks(true);
            }, cooldownTime2 + 1e3);
          }
          return;
        }
        if (notice) {
          if (errorMessage.includes("rate limit") || errorMessage.includes("Please wait")) {
            notice.setMessage(`Rate limit reached. ${errorMessage}`);
          } else {
            notice.setMessage(`Error syncing bookmarks: ${errorMessage}`);
          }
          setTimeout(() => notice == null ? void 0 : notice.hide(), 1e4);
        }
        let cooldownTime = 5 * 60 * 1e3;
        if (errorMessage.includes("wait approximately")) {
          const minutesMatch = errorMessage.match(/wait approximately (\d+) more minutes/);
          if (minutesMatch && minutesMatch[1]) {
            const waitMinutes = parseInt(minutesMatch[1], 10);
            cooldownTime = (waitMinutes + 1) * 60 * 1e3;
          }
        }
        this.setCooldown(cooldownTime);
        if (isAutoSync) {
          if (this.syncTimer) {
            clearTimeout(this.syncTimer);
          }
          this.syncTimer = setTimeout(() => {
            this.twitterService.log(`Retrying sync after error cooldown of ${Math.round(cooldownTime / 6e4)} minutes`, "info");
            this.syncBookmarks(true);
          }, cooldownTime + 1e3);
        }
      }
    } finally {
      this.settings.syncInProgress = false;
      await this.saveSettings();
    }
  }
  validateSettings(showNotices = true) {
    if (!this.settings.clientId) {
      if (showNotices)
        new import_obsidian2.Notice("Please configure your X API Client ID in the settings.", 5e3);
      return false;
    }
    if (!this.settings.oauth2AccessToken) {
      if (showNotices)
        new import_obsidian2.Notice("Please authorize with X to generate an access token.", 5e3);
      return false;
    }
    if (!this.settings.targetFolder) {
      if (showNotices)
        new import_obsidian2.Notice("Please specify a target folder in the settings.", 5e3);
      return false;
    }
    if (this.settings.storageMethod === "single" && !this.settings.singleFileName) {
      if (showNotices)
        new import_obsidian2.Notice("Please specify a filename for single file storage.", 5e3);
      return false;
    }
    return true;
  }
  onunload() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.singleFileName) {
      this.settings.singleFileName = DEFAULT_SETTINGS.singleFileName;
      await this.saveSettings();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async initiateTwitterAuth() {
    this.twitterService.log("initiateTwitterAuth: Called", "debug");
    if (!this.settings.clientId) {
      new import_obsidian2.Notice("Please enter your Twitter Client ID in the settings.");
      this.twitterService.log("initiateTwitterAuth: Client ID missing", "error");
      return;
    }
    try {
      this.authState = this.twitterService.generateRandomString(32);
      this.twitterService.log(`initiateTwitterAuth: Generated state: ${this.authState}`, "debug");
      const { url: authUrl, codeVerifier } = await this.twitterService.generateAuthUrl(this.authState);
      this.twitterService.log(`initiateTwitterAuth: Generated auth URL: ${authUrl}`, "debug");
      this.currentCodeVerifier = codeVerifier;
      this.twitterService.log(`initiateTwitterAuth: Stored currentCodeVerifier: ${this.currentCodeVerifier ? this.currentCodeVerifier.substring(0, 10) + "..." : "null"}`, "debug");
      this.twitterService.log("AUTHENTICATION FLOW START: Opening browser for Twitter OAuth. After authorizing, you should be redirected back to Obsidian.", "info");
      this.twitterService.log("If you're seeing a 'Something went wrong' error from Twitter, check that your callback URL in Twitter Developer Portal EXACTLY matches: obsidian://bookmark-bridge/callback", "info");
      new import_obsidian2.Notice("Redirecting to Twitter for authentication... Please complete the process in your browser.");
      window.open(authUrl);
    } catch (error) {
      this.twitterService.log(`initiateTwitterAuth: Error initiating Twitter auth: ${error.message}`, "error");
      new import_obsidian2.Notice("Error initiating Twitter authentication. Check console/log file.");
      this.authState = null;
      this.currentCodeVerifier = null;
    }
  }
  async handleAuthCallback(params) {
    this.twitterService.log(`handleAuthCallback: Called with params: ${JSON.stringify(params)}`, "debug");
    if (!this.authState || !this.currentCodeVerifier) {
      this.twitterService.log("handleAuthCallback: Ignoring callback because authState or currentCodeVerifier is null (already processed or invalid state).", "error");
      return;
    }
    let code = params.code;
    let state = params.state;
    this.twitterService.log(`Parameters received: ${JSON.stringify(params)}`, "info");
    if (!code && params.callback && typeof params.callback === "string") {
      this.twitterService.log("Attempting to extract code/state from callback path segment", "debug");
      try {
        if (params.callback.includes("?")) {
          const callbackUrl = "https://dummy.com/" + params.callback;
          const urlObj = new URL(callbackUrl);
          code = urlObj.searchParams.get("code") || code;
          state = urlObj.searchParams.get("state") || state;
          this.twitterService.log(`Extracted from URL: code=${code == null ? void 0 : code.substring(0, 10)}..., state=${state}`, "debug");
        } else if (params.callback.includes("code=") || params.callback.includes("state=")) {
          const queryParams = new URLSearchParams(params.callback);
          code = queryParams.get("code") || code;
          state = queryParams.get("state") || state;
          this.twitterService.log(`Extracted from query string: code=${code == null ? void 0 : code.substring(0, 10)}..., state=${state}`, "debug");
        }
      } catch (e) {
        this.twitterService.log(`Failed to parse callback: ${e}`, "error");
      }
    }
    const currentNotice = new import_obsidian2.Notice("Processing Twitter authentication callback...", 0);
    this.twitterService.log(`Final extracted code: ${code ? code.substring(0, 10) + "..." : "null"}`, "debug");
    this.twitterService.log(`Final extracted state: ${state}`, "debug");
    this.twitterService.log(`Expected state (this.authState): ${this.authState}`, "debug");
    if (!state || state !== this.authState) {
      this.twitterService.log("handleAuthCallback: Invalid state parameter.", "error");
      this.twitterService.log(`Received state: "${state}", Expected state: "${this.authState}"`, "error");
      currentNotice.setMessage("Authentication failed: Invalid state. Please try again.");
      setTimeout(() => currentNotice.hide(), 5e3);
      this.authState = null;
      this.currentCodeVerifier = null;
      return;
    }
    this.authState = null;
    this.twitterService.log("State validated and cleared.", "debug");
    if (!code) {
      this.twitterService.log("No authorization code received.", "error");
      currentNotice.setMessage("Authentication failed: No authorization code received.");
      setTimeout(() => currentNotice.hide(), 5e3);
      this.currentCodeVerifier = null;
      return;
    }
    if (!this.currentCodeVerifier) {
      this.twitterService.log("Critical error - currentCodeVerifier is null before token exchange.", "error");
      currentNotice.setMessage("Authentication error: Missing internal verifier. Please try again.");
      setTimeout(() => currentNotice.hide(), 5e3);
      return;
    }
    this.settings.codeVerifier = this.currentCodeVerifier;
    this.currentCodeVerifier = null;
    this.twitterService.log(`Assigned currentCodeVerifier to settings.codeVerifier for service call: ${this.settings.codeVerifier ? this.settings.codeVerifier.substring(0, 10) + "..." : "null"}`, "debug");
    try {
      const callbackUrl = "obsidian://bookmark-bridge/callback";
      this.twitterService.log("Attempting to exchange auth code for token...", "debug");
      const success = await this.twitterService.exchangeAuthCodeForToken(code, callbackUrl);
      if (success) {
        this.twitterService.log("Token exchange successful.", "info");
        currentNotice.setMessage("Successfully authenticated with Twitter!");
        setTimeout(() => currentNotice.hide(), 5e3);
        this.refreshSettingsUI();
      } else {
        this.twitterService.log("Token exchange failed.", "error");
        currentNotice.setMessage("Failed to obtain access token from Twitter. Check log file.");
        setTimeout(() => currentNotice.hide(), 5e3);
      }
    } catch (error) {
      this.twitterService.log(`Error exchanging auth code for token: ${error.message}`, "error");
      currentNotice.setMessage("Error during Twitter authentication. Check log file.");
      setTimeout(() => currentNotice.hide(), 5e3);
    } finally {
      this.twitterService.log("Entering finally block.", "debug");
      this.authState = null;
      this.currentCodeVerifier = null;
      if (this.settings.codeVerifier !== "") {
        this.twitterService.log("Clearing settings.codeVerifier in finally block.", "debug");
        this.settings.codeVerifier = "";
        await this.saveSettings();
      }
    }
  }
  refreshSettingsUI() {
    this.twitterService.log("Attempting to refresh settings tab UI...", "debug");
    try {
      const settingsInstance = this.app.setting;
      if (settingsInstance && settingsInstance.settingTabs) {
        const settingTab = settingsInstance.settingTabs.find((tab) => tab instanceof BookmarkBridgeSettingTab);
        if (settingTab) {
          this.twitterService.log("Found settings tab instance, refreshing UI", "debug");
          settingTab.containerEl.empty();
          settingTab.display();
        } else {
          this.twitterService.log("Settings tab not found in settingTabs", "debug");
        }
      }
      this.twitterService.log("Trying to open plugin settings tab to force refresh", "debug");
      this.app.setting.open("bookmark-bridge");
    } catch (uiError) {
      this.twitterService.log(`Error refreshing settings UI: ${uiError}`, "error");
    }
  }
  logOAuthSetupInstructions() {
    this.twitterService.log("=== TWITTER OAUTH SETUP INSTRUCTIONS ===", "info");
    this.twitterService.log("To set up Twitter OAuth correctly for this plugin:", "info");
    this.twitterService.log("1. Go to https://developer.x.com and log in", "info");
    this.twitterService.log("2. Navigate to your App's settings in the developer portal", "info");
    this.twitterService.log("3. Under 'User authentication settings', ensure OAuth 2.0 is enabled", "info");
    this.twitterService.log("4. Set App type to 'Native App' (or 'Web App' if running on a server)", "info");
    this.twitterService.log("5. Add EXACTLY this URL to the 'Callback URLs / Redirect URLs' section:", "info");
    this.twitterService.log("   obsidian://bookmark-bridge/callback", "info");
    this.twitterService.log("6. Make sure the URL is saved in your app settings", "info");
    this.twitterService.log("7. IMPORTANT: The URL format with '/callback' is correctly registered", "info");
    this.twitterService.log("   in the plugin's protocol handlers", "info");
    this.twitterService.log("===================================", "info");
  }
  registerProtocolHandlers() {
    this.twitterService.log("Registering protocol handler for 'bookmark-bridge/callback'", "debug");
    this.registerObsidianProtocolHandler("bookmark-bridge/callback", (params) => {
      this.twitterService.log("CALLBACK TRIGGERED: Protocol handler for 'bookmark-bridge/callback' with params: " + JSON.stringify(params), "info");
      this.handleAuthCallback(params);
    });
    this.twitterService.log("Registering protocol handler for 'bookmark-bridge'", "debug");
    this.registerObsidianProtocolHandler("bookmark-bridge", (params) => {
      this.twitterService.log("CALLBACK TRIGGERED: Protocol handler for 'bookmark-bridge' with params: " + JSON.stringify(params), "info");
      this.handleAuthCallback(params);
    });
  }
};
var BookmarkBridgeSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.innerHTML = "";
    containerEl.createEl("style", {
      text: `
				.auth-status-container {
					margin-top: 10px;
					margin-bottom: 20px;
				}
				.oauth2-status {
					margin-top: 8px;
					padding: 8px;
					border-radius: 4px;
				}
				.oauth2-status.connected {
					background-color: var(--background-modifier-success);
				}
				.oauth2-status.disconnected {
					background-color: var(--background-modifier-error);
				}
			`
    });
    containerEl.createEl("h2", { text: "Bookmark Bridge Settings" });
    new import_obsidian2.Setting(containerEl).setName("X API Setup Guide").setDesc("Learn how to get your X API credentials for the OAuth 2.0 PKCE flow. This is required to use the plugin.").addButton((button) => button.setButtonText("View Setup Guide").onClick(() => {
      window.open("https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code", "_blank");
    }));
    containerEl.createEl("h3", { text: "X API Configuration (OAuth 2.0)" });
    const authStatusEl = containerEl.createDiv({ cls: "auth-status-container" });
    this.renderAuthStatus(authStatusEl);
    new import_obsidian2.Setting(containerEl).setName("Client ID").setDesc("Your X App's Client ID (from Twitter Developer Portal -> Project -> App -> Keys & Tokens).").addText((text) => text.setPlaceholder("Enter your Client ID").setValue(this.plugin.settings.clientId).onChange(async (value) => {
      this.plugin.settings.clientId = value.trim();
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian2.Setting(containerEl).setName("Client Secret (Optional)").setDesc("Your X App's Client Secret. Needed if your app is 'Confidential' and client authentication is required for token revocation.").addText((text) => text.setPlaceholder("Enter your Client Secret if applicable").setValue(this.plugin.settings.clientSecret).onChange(async (value) => {
      this.plugin.settings.clientSecret = value.trim();
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "Storage Settings" });
    new import_obsidian2.Setting(containerEl).setName("Storage Method").setDesc("Choose how to store your Twitter bookmarks").addDropdown((dropdown) => dropdown.addOption("separate", "Separate note for each bookmark").addOption("single", "Combine all bookmarks into a single note").setValue(this.plugin.settings.storageMethod).onChange(async (value) => {
      this.plugin.settings.storageMethod = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian2.Setting(containerEl).setName("Target Folder").setDesc("Folder where your Twitter bookmarks will be saved").addText((text) => text.setPlaceholder("e.g., Twitter/Bookmarks").setValue(this.plugin.settings.targetFolder).onChange(async (value) => {
      this.plugin.settings.targetFolder = value.trim();
      await this.plugin.saveSettings();
    }));
    if (this.plugin.settings.storageMethod === "single") {
      new import_obsidian2.Setting(containerEl).setName("File Name for Single Note").setDesc("Name of the .md file if using single note storage.").addText((text) => text.setPlaceholder("e.g., twitter-bookmarks.md").setValue(this.plugin.settings.singleFileName).onChange(async (value) => {
        let fileName = value.trim();
        if (!fileName.endsWith(".md")) {
          fileName += ".md";
        }
        this.plugin.settings.singleFileName = fileName;
        await this.plugin.saveSettings();
      }));
    }
    containerEl.createEl("h3", { text: "Template Settings" });
    new import_obsidian2.Setting(containerEl).setName("Use Custom Templates").setDesc("Enable custom templates for formatting bookmarks").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.useCustomTemplate);
      toggle.onChange(async (value) => {
        this.plugin.settings.useCustomTemplate = value;
        await this.plugin.saveSettings();
        this.display();
      });
      return toggle;
    });
    if (this.plugin.settings.useCustomTemplate) {
      new import_obsidian2.Setting(containerEl).setName("Template Variables Documentation").setDesc("View the list of available template variables.").addButton((button) => button.setButtonText("View Documentation").onClick(() => {
        window.open("https://github.com/your-repo/bookmark-bridge/wiki/Template-Variables", "_blank");
      }));
      new import_obsidian2.Setting(containerEl).setName("Bookmark Note Template").setDesc("Define the template for how bookmarks are formatted as notes.").addTextArea((textArea) => {
        textArea.setValue(this.plugin.settings.template);
        textArea.inputEl.rows = 10;
        textArea.inputEl.cols = 60;
        textArea.onChange(async (value) => {
          this.plugin.settings.template = value;
          await this.plugin.saveSettings();
        });
        return textArea;
      });
      new import_obsidian2.Setting(containerEl).setName("Reset Template").setDesc("Reset template to the default value.").addButton((button) => {
        button.setButtonText("Reset to Default");
        button.onClick(async () => {
          this.plugin.settings.template = DEFAULT_SETTINGS.template;
          await this.plugin.saveSettings();
          this.display();
          new import_obsidian2.Notice("Template reset to default");
        });
        return button;
      });
    }
    containerEl.createEl("h3", { text: "Sync Settings" });
    new import_obsidian2.Setting(containerEl).setName("Automatic Syncing").setDesc("Automatically sync bookmarks periodically in the background.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.autoSync);
      toggle.onChange(async (value) => {
        this.plugin.settings.autoSync = value;
        await this.plugin.saveSettings();
        if (value) {
          this.plugin.startAutoSync();
          new import_obsidian2.Notice("Automatic syncing enabled and started.");
        } else {
          if (this.plugin.syncTimer) {
            clearTimeout(this.plugin.syncTimer);
            this.plugin.syncTimer = null;
          }
          new import_obsidian2.Notice("Automatic syncing disabled.");
        }
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Manual Sync").setDesc("Manually trigger a sync of your X bookmarks to Obsidian.").addButton((button) => button.setButtonText("Sync Now").onClick(async () => {
      await this.plugin.syncBookmarks();
    }));
    containerEl.createEl("div", { text: `Last sync: ${this.formatLastSync()}`, cls: "bookmark-bridge-last-sync setting-item-description" });
    containerEl.createEl("div", { text: `Sync status: ${this.formatSyncStatus()}`, cls: "bookmark-bridge-sync-status setting-item-description" });
    containerEl.createEl("div", {
      text: "Note: X API limits bookmarks requests to 1 per 15 minutes for free Developer accounts. Pagination is handled automatically over multiple sync sessions if needed.",
      cls: "setting-item-description"
    });
    containerEl.createEl("h3", { text: "Debug Settings" });
    containerEl.createEl("div", {
      text: "\u26A0\uFE0F WARNING: These settings are for debugging only and may cause unexpected behavior or API errors.",
      cls: "setting-item-description bookmark-bridge-warning"
    });
    new import_obsidian2.Setting(containerEl).setName("Bypass Rate Limit Checks").setDesc("DEBUG ONLY: Disable the built-in rate limit check. May result in API errors (429) if you exceed X API limits.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.bypassRateLimit);
      toggle.onChange(async (value) => {
        this.plugin.settings.bypassRateLimit = value;
        await this.plugin.saveSettings();
        if (value) {
          new import_obsidian2.Notice("\u26A0\uFE0F Rate limit checks bypassed. Use with caution!", 5e3);
          this.plugin.twitterService.log("DEBUG: Rate limit bypass has been ENABLED", "info");
        } else {
          new import_obsidian2.Notice("Rate limit checks enabled", 3e3);
          this.plugin.twitterService.log("DEBUG: Rate limit bypass has been DISABLED", "info");
        }
      });
    });
    containerEl.createEl("style", {
      text: `
				.bookmark-bridge-warning {
					color: var(--text-error);
					margin-bottom: 12px;
					font-weight: bold;
				}
			`
    });
    containerEl.createEl("h3", { text: "API Status Notice" });
    const apiStatusEl = containerEl.createEl("div", {
      cls: "bookmark-bridge-api-status-notice"
    });
    apiStatusEl.createEl("p", {
      text: "\u26A0\uFE0F IMPORTANT: We have reached our monthly Twitter API request limit on the Free Tier.",
      cls: "bookmark-bridge-api-warning"
    });
    apiStatusEl.createEl("p", {
      text: "New users may experience 429 errors when trying to sync bookmarks. We need community support to upgrade to the paid API tier."
    });
    apiStatusEl.createEl("p", {
      text: "Please see our README for information on how you can help us improve the plugin for everyone."
    });
    containerEl.createEl("style", {
      text: `
				.bookmark-bridge-api-status-notice {
					padding: 12px;
					background-color: var(--background-modifier-error-hover);
					border-left: 4px solid var(--text-error);
					margin-bottom: 20px;
					border-radius: 4px;
				}
				.bookmark-bridge-api-warning {
					font-weight: bold;
					margin-bottom: 8px;
				}
			`
    });
  }
  renderAuthStatus(containerEl) {
    containerEl.innerHTML = "";
    const isConnected = this.plugin.twitterService.hasOAuth2Credentials();
    const statusText = isConnected ? "\u2713 Connected to X API" : "\u2717 Not connected to X API. Please provide your Client ID and click Authenticate.";
    const statusClass = isConnected ? "oauth2-status connected" : "oauth2-status disconnected";
    containerEl.createEl("div", { text: statusText, cls: statusClass });
    if (isConnected) {
      new import_obsidian2.Setting(containerEl).setName("Account Actions").setDesc("Manage your X API connection.").addButton((button) => button.setButtonText("Re-authenticate").setTooltip("If you encounter issues, try authenticating with Twitter again.").onClick(async () => {
        if (!this.plugin.settings.clientId) {
          new import_obsidian2.Notice("Client ID is missing. Please enter it above.");
          return;
        }
        await this.plugin.initiateTwitterAuth();
      })).addButton((button) => button.setButtonText("Log Out / Revoke Token").setWarning().setTooltip("Disconnect the plugin from your Twitter account and revoke its access.").onClick(async () => {
        new import_obsidian2.Notice("Attempting to log out from Twitter...");
        const success = await this.plugin.twitterService.revokeToken();
        if (success) {
          new import_obsidian2.Notice("Logged out from Twitter and local tokens cleared.");
        } else {
          new import_obsidian2.Notice("Logout attempt finished. Local tokens cleared.");
        }
        this.display();
      }));
    } else {
      new import_obsidian2.Setting(containerEl).setName("Connect to Twitter").setDesc("Authorize the plugin to access your Twitter bookmarks. Ensure your Client ID is entered above.").addButton((button) => button.setButtonText("Authenticate with Twitter").setCta().setDisabled(!this.plugin.settings.clientId).onClick(async () => {
        if (!this.plugin.settings.clientId) {
          new import_obsidian2.Notice("Please enter your Client ID in the setting above before authenticating.");
          return;
        }
        await this.plugin.initiateTwitterAuth();
      }));
    }
    new import_obsidian2.Setting(containerEl).setName("Test API Connection").setDesc("Verify if the plugin can communicate with the Twitter API using current credentials.").addButton((button) => button.setButtonText("Test Connection").setDisabled(!isConnected).onClick(async () => {
      if (!isConnected) {
        new import_obsidian2.Notice("Not authenticated. Please authenticate with Twitter first.");
        return;
      }
      new import_obsidian2.Notice("Testing Twitter connection...");
      const success = await this.plugin.twitterService.testConnection();
      if (success) {
        new import_obsidian2.Notice("Twitter connection successful!");
      } else {
        new import_obsidian2.Notice("Twitter connection failed. Please check your credentials or try re-authenticating.");
      }
    }));
  }
  formatLastSync() {
    const timestamp = this.plugin.settings.lastSyncTimestamp;
    if (!timestamp) {
      return "Never";
    }
    return new Date(timestamp).toLocaleString();
  }
  formatSyncStatus() {
    if (this.plugin.settings.syncInProgress) {
      return `Sync in progress`;
    } else if (!this.plugin.settings.initialSyncComplete && this.plugin.settings.lastSyncPage > 0) {
      return `Initial sync in progress: Page ${this.plugin.settings.lastSyncPage} completed`;
    } else if (this.plugin.settings.initialSyncComplete) {
      return `Initial sync complete - syncing new bookmarks only`;
    } else {
      return `Initial sync not started`;
    }
  }
};
