// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;


contract Registration {
    
    //VARIABLES
    
    address public owner;
    
    address[] public doctorsList;
    address[] public pharmaciesList;
    
    mapping(address => bool) public isDoctorAddress;
    mapping(address => bool) public isPharmacyAddress;

    //ÉVÉNEMENTS
    
    event DoctorAdded(address indexed doctorAddress);
    event PharmacyAdded(address indexed pharmacyAddress);

    //MODIFIERS
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    //CONSTRUCTOR
    
    constructor() {
        owner = msg.sender;
    }

    //AJOUTER

    function addDoctor(address _doctorAddress) external onlyOwner {
        require(_doctorAddress != address(0), "Invalid address");
        require(!isDoctorAddress[_doctorAddress], "Already a doctor");
        require(!isPharmacyAddress[_doctorAddress], "Cannot be both");

        isDoctorAddress[_doctorAddress] = true;
        doctorsList.push(_doctorAddress);

        emit DoctorAdded(_doctorAddress);
    }

    function addPharmacy(address _pharmacyAddress) external onlyOwner {
        require(_pharmacyAddress != address(0), "Invalid address");
        require(!isPharmacyAddress[_pharmacyAddress], "Already a pharmacy");
        require(!isDoctorAddress[_pharmacyAddress], "Cannot be both");

        isPharmacyAddress[_pharmacyAddress] = true;
        pharmaciesList.push(_pharmacyAddress);

        emit PharmacyAdded(_pharmacyAddress);
    }

    //VÉRIFIER

    function isDoctor(address _address) external view returns (bool) {
        return isDoctorAddress[_address];
    }

    function isPharmacy(address _address) external view returns (bool) {
        return isPharmacyAddress[_address];
    }

    function isPatient(address _address) external view returns (bool) {
        return !isDoctorAddress[_address] && !isPharmacyAddress[_address];
    }

    function getRole(address _address) external view returns (string memory) {
        if (isDoctorAddress[_address]) {
            return "DOCTOR";
        } else if (isPharmacyAddress[_address]) {
            return "PHARMACY";
        } else {
            return "PATIENT";
        }
    }

    //CONSULTER

    function getDoctorsList() external view returns (address[] memory) {
        return doctorsList;
    }

    function getPharmaciesList() external view returns (address[] memory) {
        return pharmaciesList;
    }

    function getDoctorsCount() external view returns (uint256) {
        return doctorsList.length;
    }

    function getPharmaciesCount() external view returns (uint256) {
        return pharmaciesList.length;
    }
}