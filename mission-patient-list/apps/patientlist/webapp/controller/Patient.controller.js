sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/health/example/mission/patientlist/utils/Formatter",
	"sap/ui/Device"
], function (Controller, Formatter, Device) {
	"use strict";

	return Controller.extend("com.sap.health.example.mission.patientlist.controller.Patient", {

		formatter: Formatter,

		onInit: function () {
			sap.ui.getCore().byId('container-ui---app--app').setBusy(true);
			this.oTable = this.getView().byId("patientList");
			this.oModel = this.getView().getModel();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oModel = this.getOwnerComponent().getModel();
			this.oClientModel = this.getOwnerComponent().getModel("client");
		},

		_updateTableHeader: function (iCount) {
			var titleStr = this.getView().getModel("i18n").getProperty("patientsCount");
			var replacedStr = jQuery.sap.formatMessage(titleStr, iCount);
			this.byId('patientsPage').setTitle(replacedStr);
			sap.ui.getCore().byId('container-ui---app--app').setBusy(false);
		},

		onAfterRendering: function () {
			this.byId("patientList").getBinding("items").attachChange(function (oEvent) {
				var sCurrentHash = this.oRouter.getHashChanger().getHash();
				if (!Device.system.phone && sCurrentHash == '') {
					var sID = oEvent.getSource().aKeys[0].split("Patient/")[1];
					this.getOwnerComponent().getRouter().navTo("detail", { id: sID }, true);
				}
				this._updateTableHeader(oEvent.getSource().getLength());
			}.bind(this));
		},
		onSelectionChange: function (oEvent) {
			var sID = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("id");
			this.getOwnerComponent().getRouter()
				.navTo("detail",
					{ id: sID },
					!Device.system.phone);
		}
	});
});
