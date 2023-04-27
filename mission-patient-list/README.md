# Mission-Patient-List

### Prerequistes

All of these preqrquistes are part of the GET STARTED and BUILD phases of the mission.

1. Cloud Foundry Subaccount, Space in SAP BTP Platform 
    * Use a dedicated space
    * Keep space names small and unique: The total character length is 63 for url. This is inclusive of the subdomain  
2. Cloud Foundry Subaccount should have the following entitlements
    1. SAP Event Mesh (default plan)
    2. SAP Health Data Services for FHIR (default plan)
    3. Cloud Portal Service (standard plan)
    4. Cloud Foundry Runtime Memory
3. CloudFoundry [CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) should be installed in the local system
4. [MTA Build Tool](https://sap.github.io/cloud-mta-build-tool/) should be installed in the local system
5. Create SAP Event Mesh Instance and create a service key
6. Create SAP Health Data Services for FHIR Instance with the name  `new-health` with unique namespace, ems credentials
    ```
    {
        "namespace":<unique>
        "ems_credentials":{

        }
    }
    ```
7. Create service key for the instance and run the default authorizations necessary to access the data
8. Create the necessary role collections for the UI access and assign it to the user
9. Prepare the instance with data as mentioned in the mission

### Assumptions

Certain urls in UI is hardcoded to fetch the data. Kindly ensure the instance is loaded with the correct urls mentioned below
1. Codesystems
    1. http://sap.com/healthcare/hdsf/CodeSystem/patConditionIncludedCodes
    2. http://sap.com/healthcare/hdsf/CodeSystem/patConditionExcludedCodes
2. RuleSet - https://sap.com/healthcare/fhir/RuleSet/createListOfPatients
3. StructureDefinition of Extended Patient - https://example.org/fhir/StructureDefinition/PatientForClinicalStudy

### Deployment 

1. `mbt build`
2. `cf bg-deploy mta_archives/sap-health-example-mission_1.0.0.mtar -f --no-confirm `
3. This is one time activity 
`cf map-route sap-health-example-mission-approuter-<blue/green> cfapps.eu10.hana.ondemand.com -n <sub-domain>-<host>`

### Not Implemented

1. Variant Management (the UI has dummy elements)
2. Free Text Search
3. Add and other table toolbar features
