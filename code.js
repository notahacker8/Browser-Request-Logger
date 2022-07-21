
// Wrapped to support eval() (I guess?)

var http_req_logger = (function () {

  // -- START OF ORIGINAL CODE

  function obj_to_str(obj) {
    var str = "{";
    var c = 0;
    for (var p in obj) {
      if (c > 0) {
        str += ", ";
      };
      c++;
      str += p;
      str += ": ";
      var v = obj[p];
      if (typeof (v) === "string") {
        v = "\"" + v + "\"";
      };
      str += v;
    };
    str += "}";
    return str;
  };


  function arg_array_to_str(args) {
    var str = "";
    var c = 0;
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (c > 0) {
        str += ", ";
      };
      c++;
      if (typeof (arg) === "string") {
        arg = "\"" + arg + "\"";
      } else if (typeof (arg) === "object") {
        arg = obj_to_str(arg);
      };
      str += arg;
    };
    return str;
  };






  var sent_fetch = [];
  var sent_xhr = [];
  var opened_xhr = [];

  var chrono_logs = [];

  var dwnld_method = "blob";




  function download_logs(logs, method) {
    var data = "";
    for (var i = 0; i < logs.length; i++) {
      data += "\n\n";
      data += logs[i].get_log_string();
    };

    var url = "";
    var a = document.createElement("a");
    a.download = "logs";

    if (method === "blob") {
      var blob = new Blob([data], {type: "text/plain"});
      url = window.URL.createObjectURL(blob);
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    if (method === "base64") {
      url = "data:text/plain;base64," + btoa(data);
      a.href = url;
      a.click();
    }
    a.remove();
  };


  function set_dwnld_method(m)
  {
    dwnld_method = m;
  };

  function download_all_logs()
  {
    download_logs(chrono_logs, dwnld_method);
  };

  function download_opened_xhr()
  {
    download_logs(opened_xhr, dwnld_method);
  };

  function download_sent_xhr()
  {
    download_logs(sent_xhr, dwnld_method);
  };

  function download_sent_fetch()
  {
    download_logs(sent_fetch, dwnld_method);
  };







  var old_xhr_send = XMLHttpRequest.prototype.send;
  var old_xhr_open = XMLHttpRequest.prototype.open;
  var old_fetch = fetch;


  function xhr_open_info(request, method, url, async, user, password) {
    this.func_name = "XMLHttpRequest.open"
    this.args = [].slice.call(arguments, 1);
    this.request = request;
    this.method = method;
    this.url = url;
    this.async = async;
    this.user = user;
    this.password = password;
    this.date = (new Date()).toString();
    this.get_log_string = function () {
      return this.func_name + "(" + arg_array_to_str(this.args) + ")";
    };
  };

  function xhr_send_info(request, body) {
    this.func_name = "XMLHttpRequest.send";
    this.args = [].slice.call(arguments, 1);
    this.request = request;
    this.body = body;
    this.date = (new Date()).toString();
    this.get_log_string = function () {
      return this.func_name + "(" + arg_array_to_str(this.args) + ")";
    };
  };

  function fetch_info(request) {
    this.func_name = "fetch"
    this.args = [].slice.call(arguments, 0);
    this.request = request;
    this.date = (new Date()).toString();
    this.get_log_string = function () {
      return this.func_name + "(" + arg_array_to_str(this.args) + ")";
    };
  };


  xhr_send_info.prototype = {};
  xhr_open_info.prototype = {};
  fetch_info.prototype = {};

  xhr_send_info.prototype.constructor = xhr_send_info;
  xhr_open_info.prototype.constructor = xhr_open_info;
  fetch_info.prototype.constructor = fetch_info;











  function xhr_send_middle_man(request, body) {
    var info = new xhr_send_info(request, body);
    sent_xhr.push(info);
    chrono_logs.push(info);
  };

  function xhr_open_middle_man(request, method, url, async, user, password) {
    var info = new xhr_open_info(request, method, url, async, user, password);
    opened_xhr.push(info);
    chrono_logs.push(info);
  };

  function fetch_middle_man(request) {
    var info = new fetch_info(request);
    sent_fetch.push(info);
    chrono_logs.push(info);
  };








  XMLHttpRequest.prototype.send = function (body) {
    var args = [].slice.call(arguments, 0);
    xhr_send_middle_man(this, body);
    return old_xhr_send.apply(this, args);
  };


  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    var args = [].slice.call(arguments, 0);
    xhr_open_middle_man(this, method, url, async, user, password);
    return old_xhr_open.apply(this, args);
  };


  window.fetch = function (request) {
    var args = [].slice.call(arguments, 0);
    fetch_middle_man(request);
    return old_fetch.apply(this, args);
  };


  alert("logger loaded!");

  return {
    set_dwnld_method: set_dwnld_method,
    download_all_logs: download_all_logs,
    download_opened_xhr: download_opened_xhr,
    download_sent_xhr: download_sent_xhr,
    download_sent_fetch: download_sent_fetch
  };

  // -- END OF ORIGINAL CODE


})();

