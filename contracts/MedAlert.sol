// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "./Registration.sol";

contract MedAlert {

    struct Medicine {
        string medicineId;
        string medicineName;
        uint256 purchaseDate;
        uint256 quantity;
        bool hasAlerts;
        uint256 alertCount;
        bool isValidatedAlert;
    }

    struct SideEffect {
        uint256 reportId;
        address patientAddress;
        string medicineId;
        string symptom;
        uint256 reportDate;
        bool isValidated;
        address validatedByDoctor;
        uint8 severity;
        bool isActive;
    }

    //VARIABLES
    address public owner;
    Registration public registrationContract;

    uint256 public nextReportId = 1;
    uint256 public ALERT_THRESHOLD = 3;

    mapping(address => Medicine[]) public medicineHistory;
    mapping(uint256 => SideEffect) public sideEffects;
    mapping(string => uint256[]) public sideEffectsByMedicine;
    mapping(address => string[]) public activeAlerts;
    mapping(address => mapping(string => bool)) public patientHasMedicine;

    //EVENEMENTS
    event MedicineAdded(address indexed pharmacyAddress, address indexed patientAddress, string medicineId, string medicineName, uint256 quantity);
    event SideEffectReported(uint256 indexed reportId, address indexed patientAddress, string medicineId);
    event SideEffectValidated(uint256 indexed reportId, address indexed doctorAddress, uint8 severity);
    event AlertTriggered(string indexed medicineId, uint256 alertCount);
    event AlertDeactivated(string indexed medicineId);

    //MODIFIER
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyPharmacy() {
        require(registrationContract.isPharmacy(msg.sender), "Only pharmacies can call this function");
        _;
    }

    modifier onlyDoctor() {
        require(registrationContract.isDoctor(msg.sender), "Only doctors can call this function");
        _;
    }

    modifier onlyPatient() {
        require(registrationContract.isPatient(msg.sender), "Only patients can call this function");
        _;
    }

    //CONSTRUCTOR
    constructor(address _registrationContractAddress) {
        owner = msg.sender;
        registrationContract = Registration(_registrationContractAddress);
    }

    //PHARMACIE
    function addMedicine(
        address _patientAddress,
        string calldata _medicineId,
        string calldata _medicineName,
        uint256 _quantity
    ) external onlyPharmacy {
        require(_patientAddress != address(0), "Invalid patient address");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(bytes(_medicineId).length > 0, "Medicine ID cannot be empty");
        require(bytes(_medicineName).length > 0, "Medicine name cannot be empty");

        Medicine memory newMedicine = Medicine(
            _medicineId,
            _medicineName,
            block.timestamp,
            _quantity,
            false,
            0,
            false
        );

        medicineHistory[_patientAddress].push(newMedicine);
        patientHasMedicine[_patientAddress][_medicineId] = true;

        emit MedicineAdded(msg.sender, _patientAddress, _medicineId, _medicineName, _quantity);
    }

    //PATIENTS
    function reportSideEffect(
        string calldata _medicineId,
        string calldata _symptom
    ) external onlyPatient {
        require(bytes(_medicineId).length > 0, "Medicine ID cannot be empty");
        require(bytes(_symptom).length > 0, "Symptom cannot be empty");
        require(patientHasMedicine[msg.sender][_medicineId], "You don't have this medicine");

        uint256 newReportId = nextReportId;
        nextReportId++;

        SideEffect memory newReport = SideEffect(
            newReportId,
            msg.sender,
            _medicineId,
            _symptom,
            block.timestamp,
            false,
            address(0),
            0,
            true
        );

        sideEffects[newReportId] = newReport;
        sideEffectsByMedicine[_medicineId].push(newReportId);

        emit SideEffectReported(newReportId, msg.sender, _medicineId);
    }

    //MeDECIN
    function validateSideEffect(
        uint256 _reportId,
        uint8 _severity
    ) external onlyDoctor {
        require(_severity >= 1 && _severity <= 10, "Severity must be between 1 and 10");

        SideEffect storage report = sideEffects[_reportId];
        require(report.reportId != 0, "Report does not exist");
        require(!report.isValidated, "Report already validated");

        report.isValidated = true;
        report.validatedByDoctor = msg.sender;
        report.severity = _severity;

        emit SideEffectValidated(_reportId, msg.sender, _severity);

        _checkAndTriggerAlert(report.medicineId);
    }

    //ALERTES
    function _checkAndTriggerAlert(string memory _medicineId) internal {
        uint256[] memory reports = sideEffectsByMedicine[_medicineId];
        uint256 validatedModerateCount = 0;

        for (uint i = 0; i < reports.length; i++) {
            SideEffect memory report = sideEffects[reports[i]];
            if (report.isValidated && report.severity >= 5) {
                validatedModerateCount++;
            }
        }

        if (validatedModerateCount >= ALERT_THRESHOLD) {
            _triggerAlert(_medicineId, validatedModerateCount);
        }
    }

    function _triggerAlert(string memory _medicineId, uint256 _alertCount) internal {
        uint256[] memory reports = sideEffectsByMedicine[_medicineId];

        for (uint i = 0; i < reports.length; i++) {
            address patientAddr = sideEffects[reports[i]].patientAddress;

            bool alreadyAlerting = false;
            for (uint j = 0; j < activeAlerts[patientAddr].length; j++) {
                if (keccak256(abi.encodePacked(activeAlerts[patientAddr][j])) ==
                    keccak256(abi.encodePacked(_medicineId))) {
                    alreadyAlerting = true;
                    break;
                }
            }

            if (!alreadyAlerting) {
                activeAlerts[patientAddr].push(_medicineId);
            }
        }

        emit AlertTriggered(_medicineId, _alertCount);
    }

    function deactivateAlert(string calldata _medicineId) external onlyOwner {
        uint256[] memory reports = sideEffectsByMedicine[_medicineId];

        for (uint i = 0; i < reports.length; i++) {
            address patientAddr = sideEffects[reports[i]].patientAddress;

            for (uint j = 0; j < activeAlerts[patientAddr].length; j++) {
                if (keccak256(abi.encodePacked(activeAlerts[patientAddr][j])) ==
                    keccak256(abi.encodePacked(_medicineId))) {
                    activeAlerts[patientAddr][j] = activeAlerts[patientAddr][activeAlerts[patientAddr].length - 1];
                    activeAlerts[patientAddr].pop();
                    break;
                }
            }
        }

        emit AlertDeactivated(_medicineId);
    }

    //LIRE
    function getMyMedicineHistory() external view onlyPatient returns (Medicine[] memory) {
        return medicineHistory[msg.sender];
    }

    function getMyActiveAlerts() external view onlyPatient returns (string[] memory) {
        return activeAlerts[msg.sender];
    }

    function getMedicineHistory(address _patientAddress) external view returns (Medicine[] memory) {
        return medicineHistory[_patientAddress];
    }

    function getMedicineCount(address _patientAddress) external view returns (uint256) {
        return medicineHistory[_patientAddress].length;
    }

    function getSideEffectsByMedicine(string calldata _medicineId) external view returns (uint256[] memory) {
        return sideEffectsByMedicine[_medicineId];
    }

    function getSideEffectDetails(uint256 _reportId) external view returns (SideEffect memory) {
        require(sideEffects[_reportId].reportId != 0, "Report does not exist");
        return sideEffects[_reportId];
    }

    function getValidatedReportCount(string calldata _medicineId) external view returns (uint256) {
        uint256[] memory reports = sideEffectsByMedicine[_medicineId];
        uint256 validatedCount = 0;

        for (uint i = 0; i < reports.length; i++) {
            if (sideEffects[reports[i]].isValidated) {
                validatedCount++;
            }
        }

        return validatedCount;
    }

    function getPatientActiveAlerts(address _patientAddress) external view returns (string[] memory) {
        return activeAlerts[_patientAddress];
    }

    function hasAlert(address _patientAddress, string calldata _medicineId) external view returns (bool) {
        for (uint i = 0; i < activeAlerts[_patientAddress].length; i++) {
            if (keccak256(abi.encodePacked(activeAlerts[_patientAddress][i])) ==
                keccak256(abi.encodePacked(_medicineId))) {
                return true;
            }
        }
        return false;
    }

    //ADMIN
    function setAlertThreshold(uint256 _newThreshold) external onlyOwner {
        require(_newThreshold > 0, "Threshold must be greater than 0");
        ALERT_THRESHOLD = _newThreshold;
    }

    function getAlertThreshold() external view returns (uint256) {
        return ALERT_THRESHOLD;
    }
}