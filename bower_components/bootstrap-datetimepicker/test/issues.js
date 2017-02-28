(function() {
  suite('issue', function() {
    beforeEach(setupDateTimePicker());
    afterEach(teardownDateTimePicker());
    test("4 - TypeError: Cannot call method 'data' of undefined", function() {
      teardownDateTimePicker().call(this);
      setupDateTimePicker({
        markup: "<div class=\"input-append datetimepicker\"\n    style=\"display:inline-block\">\n  <input type=\"text\" class=\"\" name=\"start_time\" id=\"start_time\"\n             value=\"2012-12-30 08:00:00\" original-value=\"2012-12-30\n             08:00:00\" size=\"30\">\n  <span class=\"add-on\"><i class=\"glyph-icon-calendar\"></i></span>\n</div>",
        format: 'yyyy-MM-dd hh:mm:ss',
        language: 'en',
        pickDate: true,
        pickTime: true,
        hourStep: 1,
        minuteStep: 15,
        secondStep: 30,
        inputMask: true
      }).call(this);
      return this.dateShouldEqual(2012, 11, 30, 8);
    });
    test('5 - Date value problem when click on time', function() {
      this.addon.click();
      this.widget.find('.datepicker .day:contains(25)').click();
      this.widget.find('.picker-switch').click();
      this.widget.find('[data-time-component=minutes]').click();
      return expect(this.picker.viewDate.getUTCFullYear()).to.equal(1905);
    });
    test("6 - Doesn't always change month view", function() {
      this.input.val('05/01/1905 00:00:00 000');
      this.input.change();
      expect(this.widget.find('.datepicker-days .switch').text()).to.equal('May 1905');
      this.widget.find('.datepicker-days .next').click();
      return expect(this.widget.find('.datepicker-days .switch').text()).to.equal('June 1905');
    });
    test('7 - Picking a date from January while viewing December yields a November date', function() {
      this.input.val('12/25/2012 01:01:01 000');
      this.input.change();
      this.dateWidget.find('.datepicker-days .day.new:contains(2)').click();
      return this.dateShouldEqual(2013, 0, 2, 1, 1, 1);
    });
    return test('61 - Delete date string and then select date by click the icon does not work', function() {
      this.input.val('');
      this.input.change();
      this.addon.click();
      this.widget.find('.datepicker .day:contains(25)').click();
      return expect(this.input.val()).to.equal('05/25/1905 21:52:14 0');
    });
  });

}).call(this);
