(function() {
  describe('datetimepicker', function() {
    beforeEach(setupDateTimePicker());
    afterEach(teardownDateTimePicker());
    it('starts with date value parsed from input value', function() {
      this.dateShouldEqual(1905, 4, 1, 21, 52, 14);
      expect(this.dateWidget.find('.day.active').text()).to.equal('1');
      expect(this.dateWidget.find('.month.active').text()).to.equal('May');
      expect(this.dateWidget.find('.year.active').text()).to.equal('1905');
      expect(this.timeWidget.find('.timepicker-hour').html()).to.equal('21');
      expect(this.timeWidget.find('.timepicker-minute').html()).to.equal('52');
      return expect(this.timeWidget.find('.timepicker-second').html()).to.equal('14');
    });
    it('creates an invisible widget on body', function() {
      expect(this.widget.length).to.equal(1);
      return expect(this.widget.is(':hidden')).to.be["true"];
    });
    it('pops up the widget when icon is clicked', function() {
      this.addon.click();
      return expect(this.widget.is(':visible')).to.be["true"];
    });
    it('hides the widget when clicking outside it', function() {
      this.addon.click();
      $('#mocha').mousedown();
      return expect(this.widget.is(':hidden')).to.be["true"];
    });
    it('does not hide widget when clicking inside it', function() {
      this.addon.click();
      this.widget.find('.datepicker .day:contains(18)').click();
      expect(this.widget.find('.datepicker .day:contains(18)').is('.active')).to.be["true"];
      return expect(this.widget.is(':visible')).to.be["true"];
    });
    it('changes day of month', function() {
      this.dateWidget.find('.datepicker-days .day:contains(25)').click();
      return this.dateShouldEqual(1905, 4, 25, 21, 52, 14);
    });
    it('changes month', function() {
      this.dateWidget.find('.datepicker-days .switch').click();
      this.dateWidget.find('.datepicker-months .month:contains(Aug)').click();
      return this.dateShouldEqual(1905, 7, 1, 21, 52, 14);
    });
    it('changes year', function() {
      this.dateWidget.find('.datepicker-days .switch').click();
      this.dateWidget.find('.datepicker-months .switch').click();
      this.dateWidget.find('.datepicker-years .year:contains(1907)').click();
      return this.dateShouldEqual(1907, 4, 1, 21, 52, 14);
    });
    it('changes displayed month using arrows', function() {
      expect(this.dateWidget.find('.datepicker-days .switch').text()).to.equal('May 1905');
      this.dateWidget.find('.datepicker-days .next').click();
      expect(this.dateWidget.find('.datepicker-days .switch').text()).to.equal('June 1905');
      this.dateWidget.find('.datepicker-days .prev').click();
      return expect(this.dateWidget.find('.datepicker-days .switch').text()).to.equal('May 1905');
    });
    it('changes displayed year using arrows', function() {
      this.dateWidget.find('.datepicker-days .switch').click();
      expect(this.dateWidget.find('.datepicker-months .switch').text()).to.equal('1905');
      this.dateWidget.find('.datepicker-months .next').click();
      expect(this.dateWidget.find('.datepicker-months .switch').text()).to.equal('1906');
      this.dateWidget.find('.datepicker-months .prev').click();
      return expect(this.dateWidget.find('.datepicker-months .switch').text()).to.equal('1905');
    });
    it('changes displayed year range using arrows', function() {
      this.dateWidget.find('.datepicker-days .switch').click();
      this.dateWidget.find('.datepicker-months .switch').click();
      expect(this.dateWidget.find('.datepicker-years .switch').text()).to.equal('1900-1909');
      this.dateWidget.find('.datepicker-years .next').click();
      expect(this.dateWidget.find('.datepicker-years .switch').text()).to.equal('1910-1919');
      this.dateWidget.find('.datepicker-years .prev').click();
      return expect(this.dateWidget.find('.datepicker-years .switch').text()).to.equal('1900-1909');
    });
    it('switches to and from time picker', function(done) {
      this.widget.find('.collapse').addClass('no-transition');
      this.addon.click();
      expect(this.widget.find('.datepicker').closest('.collapse').height()).to.not.equal(0);
      expect(this.widget.find('.timepicker').closest('.collapse').height()).to.equal(0);
      this.widget.find('.picker-switch a').click();
      return this.widget.one('shown', (function(_this) {
        return function() {
          expect(_this.widget.find('.datepicker').closest('.collapse').height()).to.equal(0);
          expect(_this.widget.find('.timepicker').closest('.collapse').height()).to.not.equal(0);
          _this.widget.find('.picker-switch a').click();
          return _this.widget.one('shown', function() {
            expect(_this.widget.find('.datepicker').closest('.collapse').height()).to.not.equal(0);
            expect(_this.widget.find('.timepicker').closest('.collapse').height()).to.equal(0);
            expect(_this.timeWidget.find('.timepicker-picker').is(':visible')).to.be["true"];
            expect(_this.timeWidget.find('.timepicker-hours').is(':hidden')).to.be["true"];
            expect(_this.timeWidget.find('.timepicker-minutes').is(':hidden')).to.be["true"];
            expect(_this.timeWidget.find('.timepicker-seconds').is(':hidden')).to.be["true"];
            return done();
          });
        };
      })(this));
    });
    it('increments/decrements hour', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=incrementHours]').click();
      this.dateShouldEqual(1905, 4, 1, 22, 52, 14);
      this.timeWidget.find('[data-action=decrementHours]').click();
      return this.dateShouldEqual(1905, 4, 1, 21, 52, 14);
    });
    it('increments/decrements minutes', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=incrementMinutes]').click();
      this.dateShouldEqual(1905, 4, 1, 21, 53, 14);
      this.timeWidget.find('[data-action=decrementMinutes]').click();
      return this.dateShouldEqual(1905, 4, 1, 21, 52, 14);
    });
    it('increments/decrements minutes', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=incrementSeconds]').click();
      this.dateShouldEqual(1905, 4, 1, 21, 52, 15);
      this.timeWidget.find('[data-action=decrementSeconds]').click();
      return this.dateShouldEqual(1905, 4, 1, 21, 52, 14);
    });
    it('picks hour on hours view', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=showHours]').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':hidden')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-hours').is(':visible')).to.be["true"];
      this.timeWidget.find('.timepicker-hours .hour:contains(09)').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':visible')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-hours').is(':hidden')).to.be["true"];
      return this.dateShouldEqual(1905, 4, 1, 9, 52, 14);
    });
    it('picks minute on minutes view', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=showMinutes]').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':hidden')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-minutes').is(':visible')).to.be["true"];
      this.timeWidget.find('.timepicker-minutes .minute:contains(15)').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':visible')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-minutes').is(':hidden')).to.be["true"];
      return this.dateShouldEqual(1905, 4, 1, 21, 15, 14);
    });
    it('picks second on seconds view', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=showSeconds]').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':hidden')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-seconds').is(':visible')).to.be["true"];
      this.timeWidget.find('.timepicker-seconds .second:contains(45)').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':visible')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-seconds').is(':hidden')).to.be["true"];
      return this.dateShouldEqual(1905, 4, 1, 21, 52, 45);
    });
    it('updates date when correctly formatted date is set on input', function() {
      this.input.val('09/14/1982 01:02:03 037');
      this.input.change();
      return this.dateShouldEqual(1982, 8, 14, 1, 2, 3, 37);
    });
    it('ignores incorrectly formatted dates set on input', function() {
      this.input.val('09/14/198 01:02:03 00');
      this.input.change();
      expect(this.input.val()).to.equal('05/01/1905 21:52:14 0');
      return this.dateShouldEqual(1905, 4, 1, 21, 52, 14);
    });
    return it('unsets date when input value is erased', function() {
      this.input.val('');
      this.input.change();
      expect(this.picker.getDate()).to.be["null"];
      expect(this.picker.getLocalDate()).to.be["null"];
      this.input.val('09/14/1982 01:02:03 037');
      this.input.change();
      return this.dateShouldEqual(1982, 8, 14, 1, 2, 3, 37);
    });
  });

  describe('datetimepicker with 12-hour clock format', function() {
    beforeEach(setupDateTimePicker({
      format: 'MM/dd/yyyy HH:mm PP',
      value: '05/01/1905 09:52 PM',
      pick12HourFormat: true
    }));
    afterEach(teardownDateTimePicker());
    it('parses correctly', function() {
      this.dateShouldEqual(1905, 4, 1, 21, 52);
      expect(this.timeWidget.find('.timepicker-hour').text()).to.equal('09');
      expect(this.timeWidget.find('.timepicker-minute').text()).to.equal('52');
      expect(this.timeWidget.find('.timepicker-second').text()).to.equal('00');
      expect(this.timeWidget.find('[data-action=togglePeriod]').text()).to.equal('PM');
      this.input.val('05/01/1905 12:52 AM');
      this.input.change();
      this.dateShouldEqual(1905, 4, 1, 0, 52);
      expect(this.timeWidget.find('.timepicker-hour').text()).to.equal('12');
      expect(this.timeWidget.find('.timepicker-minute').text()).to.equal('52');
      expect(this.timeWidget.find('.timepicker-second').text()).to.equal('00');
      expect(this.timeWidget.find('[data-action=togglePeriod]').text()).to.equal('AM');
      this.input.val('05/01/1905 13:52 AM');
      this.input.change();
      this.dateShouldEqual(1905, 4, 1, 0, 52);
      this.input.val('05/01/1905 12:52 PM');
      this.input.change();
      this.dateShouldEqual(1905, 4, 1, 12, 52);
      expect(this.timeWidget.find('.timepicker-hour').text()).to.equal('12');
      expect(this.timeWidget.find('.timepicker-minute').text()).to.equal('52');
      expect(this.timeWidget.find('.timepicker-second').text()).to.equal('00');
      return expect(this.timeWidget.find('[data-action=togglePeriod]').text()).to.equal('PM');
    });
    it('formats correctly', function() {
      this.picker.setValue(Date.UTC(1905, 4, 1, 10));
      expect(this.input.val()).to.equal('05/01/1905 10:00 AM');
      this.picker.setValue(Date.UTC(1905, 4, 1, 0, 1));
      expect(this.input.val()).to.equal('05/01/1905 12:01 AM');
      this.picker.setValue(Date.UTC(1905, 4, 1, 12, 1));
      return expect(this.input.val()).to.equal('05/01/1905 12:01 PM');
    });
    return it('picks hour on hours view', function() {
      this.addon.click();
      this.widget.find('.picker-switch a').click();
      this.timeWidget.find('[data-action=showHours]').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':hidden')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-hours').is(':visible')).to.be["true"];
      this.timeWidget.find('.timepicker-hours .hour:contains(08)').click();
      expect(this.timeWidget.find('.timepicker-picker').is(':visible')).to.be["true"];
      expect(this.timeWidget.find('.timepicker-hours').is(':hidden')).to.be["true"];
      this.dateShouldEqual(1905, 4, 1, 20, 52);
      this.timeWidget.find('[data-action=togglePeriod]').click();
      this.dateShouldEqual(1905, 4, 1, 8, 52);
      expect(this.timeWidget.find('.timepicker-hours .hour').length).to.equal(12);
      this.timeWidget.find('.timepicker-hours .hour:contains(07)').click();
      this.dateShouldEqual(1905, 4, 1, 7, 52);
      this.timeWidget.find('[data-action=togglePeriod]').click();
      this.dateShouldEqual(1905, 4, 1, 19, 52);
      this.timeWidget.find('.timepicker-hours .hour:contains(12)').click();
      this.dateShouldEqual(1905, 4, 1, 12, 52);
      this.timeWidget.find('[data-action=togglePeriod]').click();
      this.timeWidget.find('.timepicker-hours .hour:contains(11)').click();
      this.dateShouldEqual(1905, 4, 1, 11, 52);
      this.timeWidget.find('.timepicker-hours .hour:contains(12)').click();
      return this.dateShouldEqual(1905, 4, 1, 0, 52);
    });
  });

  describe('datetimepicker api', function() {
    beforeEach(setupDateTimePicker());
    afterEach(teardownDateTimePicker());
    it('supports local dates', function() {
      var d;
      d = new Date(2000, 1, 15, 8, 8, 8, 743);
      this.picker.setLocalDate(d);
      return this.dateShouldEqual(2000, 1, 15, 8, 8, 8, 743);
    });
    it('supports utc dates', function() {
      var d;
      d = Date.UTC(2000, 1, 15, 8, 8, 8, 743);
      this.picker.setDate(new Date(d));
      return this.dateShouldEqual(2000, 1, 15, 8, 8, 8, 743);
    });
    it('unsets value by passing null', function() {
      this.picker.setDate(null);
      return expect(this.input.val()).to.equal('');
    });
    it('supports start date', function() {
      this.picker.setDate(new Date(Date.UTC(2002, 2, 15, 0, 0, 0, 0)));
      this.picker.setStartDate(new Date(Date.UTC(2002, 2, 14, 0, 0, 0, 0)));
      expect(this.dateWidget.find('.datepicker-days .day:contains(13)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-days .day:contains(14)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-days .prev').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-days .next').is('.disabled')).to.be["false"];
      this.dateWidget.find('.datepicker-days .switch').click();
      expect(this.dateWidget.find('.datepicker-months .month:contains(Feb)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-months .month:contains(Mar)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-months .prev').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-months .next').is('.disabled')).to.be["false"];
      this.dateWidget.find('.datepicker-months .switch').click();
      expect(this.dateWidget.find('.datepicker-years .year:contains(2001)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-years .year:contains(2002)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-years .prev').is('.disabled')).to.be["true"];
      return expect(this.dateWidget.find('.datepicker-years .next').is('.disabled')).to.be["false"];
    });
    return it('supports end date', function() {
      this.picker.setDate(new Date(Date.UTC(2002, 2, 15, 0, 0, 0, 0)));
      this.picker.setEndDate(new Date(Date.UTC(2002, 2, 16, 0, 0, 0, 0)));
      expect(this.dateWidget.find('.datepicker-days .day:contains(17)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-days .day:contains(16)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-days .next').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-days .prev').is('.disabled')).to.be["false"];
      this.dateWidget.find('.datepicker-days .switch').click();
      expect(this.dateWidget.find('.datepicker-months .month:contains(Apr)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-months .month:contains(Mar)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-months .next').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-months .prev').is('.disabled')).to.be["false"];
      this.dateWidget.find('.datepicker-months .switch').click();
      expect(this.dateWidget.find('.datepicker-years .year:contains(2003)').is('.disabled')).to.be["true"];
      expect(this.dateWidget.find('.datepicker-years .year:contains(2002)').is('.disabled')).to.be["false"];
      expect(this.dateWidget.find('.datepicker-years .next').is('.disabled')).to.be["true"];
      return expect(this.dateWidget.find('.datepicker-years .prev').is('.disabled')).to.be["false"];
    });
  });

  describe('datetimepicker with pickSeconds = false', function() {
    beforeEach(setupDateTimePicker({
      value: '09/14/1982 01:02:03 037',
      pickSeconds: false
    }));
    afterEach(teardownDateTimePicker());
    return it('hides seconds selector from time widget', function() {
      expect(this.timeWidget.find('[data-action=incrementSeconds]').length).to.equal(0);
      expect(this.timeWidget.find('[data-action=decrementSeconds]').length).to.equal(0);
      return expect(this.timeWidget.find('.timepicker-second').length).to.equal(0);
    });
  });

}).call(this);
