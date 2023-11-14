sap.ui.define(["sap/ui/core/format/DateFormat"],
	function (DateFormat) {
		"use strict";
		var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var oLocale = new sap.ui.core.Locale(sCurrentLocale);

		return {

			getLocale: function () {
				return oLocale;
			},
			/**
			 * formats a date into ex. "January 5, 2011"
			 * @returns {string} The formatted version of sDate.
			 * @param {string} sDate A string compatible with the constructor of Date.
			 */
			formatDate: function (sDate) {
				if (sDate) {
					var dateFormat = DateFormat.getDateInstance({
						style: "medium"
					}, oLocale);
					var result = dateFormat.format(new Date(sDate));
					return result;
				}
				return "";
			},

			/**
			 * formats a address line into single string ex. "January 5, 2011"
			 * @returns {string} The formatted version of aLines.
			 * @param {array} aLine A string compatible with the constructor of Date.
			 */
			formatAddressLine: function (aLine) {
				if (aLine && aLine.length>0) {
					return aLine.join(", ") 
				}
				return "";
			},

			/**
			 * formats a date time into ex. "Mar 21, 2019, 1:30:00 PM"
			 * @returns {string} The formatted version of sDate.
			 * @param {string} sDate A string compatible with the constructor of DateTime.
			 */
			formatDateTime: function (sDate) {
				if (sDate) {
					var dateFormat = DateFormat.getDateTimeInstance({
						style: "medium/short"
					}, oLocale);
					return dateFormat.format(new Date(sDate));
				}

				return "";
			},

		};
	}, true);