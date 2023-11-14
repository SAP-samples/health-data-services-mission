# Build a healthcare app with SAP Health Data Services for FHIR (example - not for productive use)

### Prerequistes

All of these preqrquistes are part of the GET STARTED and BUILD phases of the mission.

1. Cloud Foundry Subaccount, Space in SAP BTP Platform 
    * Use a dedicated space
    * Keep space names small and unique: The total character length is 63 for url. This is inclusive of the subdomain  
2. Cloud Foundry Subaccount should have the following entitlements
    1. SAP Health Data Services for FHIR (standard plan)
    2. Cloud Foundry Runtime Memory
    3. Authorization and Trust Management (xsuaa - broker plan)
3. CloudFoundry [CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) should be installed in the local system
4. [MTA Build Tool](https://sap.github.io/cloud-mta-build-tool/) should be installed in the local system
5. Create SAP Health Data Services for FHIR Instance with the name  `new-health` with unique namespace
    ```
    {
        "namespace":<unique>
    }
    ```
7. Create service key for the instance and run the default authorizations necessary to access the data
8. Create the necessary role collections for the UI access and assign it to the user
9. Prepare the instance with data as mentioned in the mission

### Deployment 

1. `mbt build`
2. `cf bg-deploy mta_archives/sap-health-example-mission_3.0.0.mtar -f --no-confirm `
3. This is one time activity 
`cf map-route sap-health-example-mission-approuter-<blue/green> cfapps.eu10.hana.ondemand.com -n <sub-domain>-<host>`

### Interaction between UI and FHIR Server

The UI is contains static content and uses the [Open UI5-FHIR](https://github.com/SAP/openui5-fhir) to perform operations to the configured FHIR Server.

The data source in the [manifest.json](apps/patientlist/webapp/manifest.json) indicates the fhir server endpoint to be used to make the ajax requests.

Sample:
```
	"sap.app": {
		"dataSources": {
			"myFHIRService": {
				"uri": "https://myfhirservicehost.com/fhir/",
				"type": "FHIR"
			}
		}
	},
	"sap.ui5": {
		"fhirModel": {
			"type": "sap.fhir.model.r4.FHIRModel",
			"dataSource": "myFHIRService"
		}
	}

```

The data source URI can be absolute/relative. 
<br>
In case of the sample app the data source URI is relative. This is then transformed into an absoulte URL by a node-js middleware know as [approuter](https://help.sap.com/docs/btp/sap-business-technology-platform/application-router). 
<br>
You can find more details on the working of approuter and the interaction to any business services endpoint [here](https://blogs.sap.com/2020/04/03/sap-application-router/).

