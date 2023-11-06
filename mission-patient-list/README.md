# Build a healthcare app with SAP Health Data Services for FHIR (example - not for productive use)

### Prerequistes

All of these preqrquistes are part of the GET STARTED and BUILD phases of the mission.

1. Cloud Foundry Subaccount, Space in SAP BTP Platform 
    * Use a dedicated space
    * Keep space names small and unique: The total character length is 63 for url. This is inclusive of the subdomain  
2. Cloud Foundry Subaccount should have the following entitlements
    1. SAP Health Data Services for FHIR (standard plan)
    2. Cloud Foundry Runtime Memory
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