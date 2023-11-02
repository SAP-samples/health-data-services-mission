sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/health/example/mission/patientlist/utils/Formatter"
], function (Controller, Formatter) {
	"use strict";

	return Controller.extend("com.sap.health.example.mission.patientlist.controller.PatientDetail", {

		formatter: Formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
			this.oModel = this.getOwnerComponent().getModel();
			this.oClientModel = this.getOwnerComponent().getModel("client");
		},

		_onObjectMatched: function (oEvent) {
			this.byId('patientDetailPage').setBusy(true);
			let sId = oEvent.getParameter("arguments").id;
			this._sId = sId;
			this.getView().bindElement({
				path: "/Patient/" + sId
			});
			this.byId('patientDetailPage').setBusy(false);
		}
	});
});
