sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/health/example/mission/patientlist/utils/Formatter",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/fhir/model/r4/FHIRFilter",
	"sap/fhir/model/r4/FHIRFilterOperator",
	"sap/fhir/model/r4/FHIRFilterType"
], function (Controller, Formatter, Filter, MessageBox, FHIRFilter, FHIRFilterOperator, FHIRFilterType) {
	"use strict";

	return Controller.extend("com.sap.health.example.mission.patientlist.controller.Patient", {

		formatter: Formatter,

		onInit: function () {
			this.getView().byId('patientsPage').setBusy(true);
			this.oTable = this.getView().byId("patientListTable");
			this.oModel = this.getView().getModel();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("main").attachPatternMatched(this._onObjectMatched, this);
			this.sCodeSystemPatCondInclURL = "http://sap.com/healthcare/hdsf/CodeSystem/patConditionIncludedCodes";
			this.sCodeSystemPatCondExcURL = "http://sap.com/healthcare/hdsf/CodeSystem/patConditionExcludedCodes";
			this.sCreatePatientRuleSetURL = "https://sap.com/healthcare/fhir/RuleSet/createListOfPatients";
			this.bPatientNationalityExists = false;
			this.sPatientExtendedSDID = "PatientForClinicalStudy"
			this.sDefaultPatientSDURL = "http://hl7.org/fhir/StructureDefinition/Patient";
			this.sPatientExtendedSDURL = "https://example.org/fhir/StructureDefinition/PatientForClinicalStudy";
			this.oModel = this.getOwnerComponent().getModel();
			this.oMetaModel = this.getOwnerComponent().getModel("meta");
			this.oRuleModel = this.getOwnerComponent().getModel("rule");
			this.oClientModel = this.getOwnerComponent().getModel("client");
			this.fetchCodeSystemIDs();
		},

		showHideNationalityColumn: function () {
			var oSelectedItem = this.getView().byId('ruleSets').getSelectedItem();
			var oModel = oSelectedItem.getBindingContext('client').getModel();
			var sBindingPath = oSelectedItem.getBindingContext('client').getPath();
			var bIsRuleBasedonExtendedPatient = oModel.getProperty(sBindingPath + '/isRuleBasedonExtendedPatient');
			if (this.oTable.getColumns().length > 4) {
				this.oTable.getColumns()[4].setVisible(bIsRuleBasedonExtendedPatient);
			}
			this.getView().byId('patientsPage').setBusy(false);
		},
		fetchCodeSystemIDs: function () {
			var that = this;
			var sCodeSystemPath = this.sCodeSystemPatCondInclURL + "," + this.sCodeSystemPatCondExcURL;
			this.oModel.sendGetRequest("/CodeSystem", {
				urlParameters: {
					url: sCodeSystemPath
				},
				success: function (oData) {
					for (var i = 0; i < oData.entry.length; i++) {
						var entry = oData.entry[i];
						if (entry.resource && entry.resource.url == that.sCodeSystemPatCondInclURL) {
							that.oClientModel.setProperty("/codeSystemCondIncID", entry.resource.id)
						}
						if (entry.resource && entry.resource.url == that.sCodeSystemPatCondExcURL) {
							that.oClientModel.setProperty("/codeSystemCondExcID", entry.resource.id)
						}
					}
					that.fetchRuleSetVersions();
				}.bind(this),
				error: function (errorMsg) {
					MessageBox.error("Error occured while fetching code systems");
				}.bind(this)
			});
		},

		fetchRuleSetVersions: function () {
			this.getView().byId('patientsPage').setBusy(true);
			this.getView().byId('patientID').setSelectedKey('');
			this.getView().byId('gender').setSelectedKey('');
			var that = this;
			this.oRuleModel.sendGetRequest("/RuleSet", {
				urlParameters: {
					url: this.sCreatePatientRuleSetURL
				},
				success: function (oData) {
					var aData = [];
					for (var i = 0; i < oData.entry.length; i++) {
						var entry = oData.entry[i];
						if (entry.resource && entry.resource.url == that.sCreatePatientRuleSetURL) {
							// find in reference 
							var oRuleVersionData = {
								"version": entry.resource.version,
								"url": entry.resource.url
							};
							if (entry.resource.version == '1.0.0') {
								oRuleVersionData.isRuleBasedonExtendedPatient = false;
							} else {
								oRuleVersionData.isRuleBasedonExtendedPatient = true;
							}
							aData.push(oRuleVersionData);
						}
					}
					var oDefaultVersion = aData.find(function(oRuleSet){
						return oRuleSet.version == '1.0.0';
					})
					if(!oDefaultVersion){
						var oRuleVersionData = {
							"version": "1.0.0",
							"url": that.sCreatePatientRuleSetURL,
							"isRuleBasedonExtendedPatient": false
						};
						aData = [oRuleVersionData].concat(aData);
					}
					that.oClientModel.setProperty("/ruleSets", aData);
					if (aData.length > 0) {
						that.oClientModel.setProperty("/selectedRuleVersion", '1.0.0');
						that.getView().byId('ruleSets').setModel(that.oClientModel, 'client');
						that.onApplyRules();
						that.getView().byId('filterBar').setShowClearOnFB(true);
						that.getView().byId('filterBar').setShowGoOnFB(true);
						that.getView().byId('applyRuleBtn').setEnabled(true);
					} else {
						this.getView().byId('patientsPage').setBusy(false);
						that.getView().byId('filterBar').setShowClearOnFB(false);
						that.getView().byId('filterBar').setShowGoOnFB(false);
						that.getView().byId('applyRuleBtn').setEnabled(false);
					}
				}.bind(this),
				error: function (errorMsg) {
					MessageBox.error("Error occured while fetching rule sets");
				}.bind(this)
			});
		},

		onApplyRules: function (oEvent) {
			this.getView().byId('patientsPage').setBusy(true);
			var that = this;
			var oSelectedItem = this.getView().byId('ruleSets').getSelectedItem();
			var sRuleSelectedVersion = oSelectedItem && oSelectedItem.getText() != "" ? oSelectedItem.getText() : '1.0.0';
			var sDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
			var oRuleSetRequestPayload = {};
			oRuleSetRequestPayload.resourceType = "RuleSetRequest";
			oRuleSetRequestPayload.ruleSet = [this.sCreatePatientRuleSetURL + "|" + sRuleSelectedVersion];
			oRuleSetRequestPayload.input = [
				{
					"query": "Patient"
				},
				{
					"query": "Condition"
				},
				{
					"query": "Procedure"
				},
				{
					"query": "CodeSystem?_filter=name%20eq%20'ConditionInclusion'%20or%20name%20eq%20'ConditionExclusion'%20or%20name%20eq%20'CountryCodes'"
				},
				{
					"query": "Consent"
				},
				{
					"resource": {
						"resourceType": "List",
						"status": "current",
						"mode": "snapshot",
						"date": sDate
					}
				}
			];
			oRuleSetRequestPayload.output = [
				{
					"ruleSet": this.sCreatePatientRuleSetURL,
					"name": "sd-list"
				}
			];
			oRuleSetRequestPayload.logRulesFired = true;
			oRuleSetRequestPayload.logLevel = {
				"system": "http://sap.com/healthcare/fhir/CodeSystem/log-level",
				"code": "all",
				"display": "All log levels"
			};
			var mParameters = {
				success: function (oData) {
					var aPatientId = []
					var aPatientIDObj = []
					var aPatientList = oData.output.length > 0 ? oData.output[0].resource.entry : [];
					aPatientList.forEach(function (entry) {
						var sId = entry.item.reference.split("/")[1];
						aPatientId.push(sId);
						var oPatientIdObj = {
							"id": sId
						};
						aPatientIDObj.push(oPatientIdObj);
					});
					that.oClientModel.setProperty("/patientIDs", aPatientIDObj);
					that.oClientModel.setProperty("/patientIDList", aPatientId);
					that.refreshTableItems(aPatientId);
				}.bind(this),
				error: function (errorMsg) {
					MessageBox.error("Error occured while applying rule");
				}.bind(this)
			};
			this.oRuleModel.sendPostRequest("/$apply-rules", oRuleSetRequestPayload, mParameters);
		},

		refreshTableItems: function (aPatientId) {
			var aFilter = [];
			var oItemTemplate = new sap.m.ColumnListItem({
				type: "Inactive",
				cells: [
					new sap.m.ObjectIdentifier({
						title: "{id}"
					}),
					new sap.m.Text({
						text: "{name/0/family} {name/0/given/0}"
					}),
					new sap.m.Text({
						text: "{gender}"
					}),
					new sap.m.Text({
						text: {
							path: 'birthDate',
							formatter: this.formatter.formatDate
						}
					}),
					new sap.m.Text({
						text: {
							path: 'extension',
							formatter: this.formatter.formatNationalityExtension
						}
					})
				]
			});
			var oBindingInfo = {
				path: "/Patient",
				template: oItemTemplate,
				templateShareable: false
			};
			if (aPatientId.length > 0) {
				aFilter.push(new FHIRFilter({
					path: "_id",
					operator: "eq",
					valueType: FHIRFilterType.string,
					value1: aPatientId.join(",")
				}));
				oBindingInfo.filters = aFilter;
			}
			this.oTable.bindAggregation("items", oBindingInfo);
			this.showHideNationalityColumn();
		},

		onSearch: function (oEvent) {
			var aFilter = [];
			var sPatiendId = this.byId('patientID').getSelectedKey();
			var sGender = this.byId('gender').getSelectedKey();
			if (sPatiendId == '') {
				sPatiendId = this.oClientModel.getProperty('/patientIDList').join(',');
			}
			aFilter.push(new FHIRFilter({
				path: "_id",
				operator: "eq",
				valueType: FHIRFilterType.string,
				value1: sPatiendId
			}));
			if (sGender != '') {
				aFilter.push(new FHIRFilter({
					path: "gender",
					operator: "eq",
					valueType: FHIRFilterType.string,
					value1: sGender
				}));
			}
			this.oTable.getBinding("items").filter(aFilter);
			this.showHideNationalityColumn();
		},

		onClear: function (oEvent) {
			var aFilter = [];
			this.byId('patientID').setSelectedKey('');
			this.byId('gender').setSelectedKey('');
			aFilter.push(new FHIRFilter({
				path: "_id",
				operator: "eq",
				valueType: FHIRFilterType.string,
				value1: this.oClientModel.getProperty('/patientIDList').join(',')
			}));
			this.oTable.getBinding("items").filter(aFilter);
		},

		_onObjectMatched: function (oEvent) {
			if (this.oTable && this.oTable.getBinding("items")) {
				this.oTable.getBinding("items").refresh();
			}
		}
	});
});
