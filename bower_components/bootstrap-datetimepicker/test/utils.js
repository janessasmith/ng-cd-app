(function() {
  var setupDateTimePicker, teardownDateTimePicker;

  setupDateTimePicker = function(opts) {
    var markup, value;
    value = '05/01/1905 21:52:14 0';
    if (opts != null ? opts.value : void 0) {
      value = opts.value;
      delete opts.value;
    }
    markup = "<div id=\"datetimepicker\" class=\"input-append date\">\n  <input type=\"text\" value=\"" + value + "\" data-format=\"MM/dd/yyyy hh:mm:ss ms\">\n  <span class=\"add-on\">\n    <i data-time-icon=\"icon-time\" data-date-icon=\"icon-calendar\"></i>\n  </span>\n</div>";
    if (opts != null ? opts.markup : void 0) {
      markup = opts.markup;
      delete opts.markup;
    }
    return function() {
      this.component = $(markup).appendTo($('#container')).datetimepicker(opts);
      this.input = this.component.find('input');
      this.addon = this.component.find('.add-on');
      this.picker = this.component.data('datetimepicker');
      this.widget = $('body > .bootstrap-datetimepicker-widget');
      this.dateWidget = this.widget.find('.datepicker');
      this.timeWidget = this.widget.find('.timepicker');
      return this.dateShouldEqual = (function(_this) {
        return function() {
          var ld, offset;
          expect(_this.picker.getDate().getTime()).to.equal(Date.UTC.apply(Date, arguments));
          ld = _this.picker.getLocalDate();
          offset = ld.getTimezoneOffset();
          offset = offset * 60 * 1000;
          return expect(_this.picker.getLocalDate().getTime()).to.equal(Date.UTC.apply(Date, arguments) + offset);
        };
      })(this);
    };
  };

  teardownDateTimePicker = function() {
    return function() {
      this.picker.destroy();
      return $('#container').empty();
    };
  };

}).call(this);
