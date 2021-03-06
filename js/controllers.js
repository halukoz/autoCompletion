// developed by Haluk ozduman, 2017
'use strict';
// controllers module contains different controllers (for this application, I implemented only one controller)
var controllers = angular.module("controllers", []);
// Main controller contains some dependencies such as scope, http, countryService, addressService and autoCompletionService. These services are injected as below.
controllers.controller('mainCtrl', ['$scope', '$rootScope','$location', '$http', 'countryService','addressService', 'autoCompletionService',
function mainCtrl($scope, $rootScope, $location, $http, countryService, addressService, autoCompletionService) {

	var http = $http;  // provide http service to use Google APIs for this application.
	var scope = $scope;
	var latitude = 0; // is a geographic coordinate
	var longitude = 0; // is a geographic coordinate

	scope.selectedCountryIndex = -1; // initially drop down selection index for countryBox sets as -1, this means that it is not selected.
	scope.selectedAddressIndex = -1; // initially drop down selection index for addressBox sets as -1, this means that it is not selected.

	scope.searchCountry = function() { // this function search countries according to the search criteria. (search criteria come from user interface with countryText ng-model)
		if (scope.countryText.length === 0) {  // if the search criteria is not specified, we do not need to search, therefore countryList is empty.
			scope.countryList = [];  // countryList is showed to the user as suggestions.
		} else {
			scope.countryList = autoCompletionService.search(countryService.getCountryList(),scope.countryText);  // if countryText is not empty, call autoCompletionService with seach function.
		}
	}

	scope.searchAddress = function() {  // this function searches addresses according to the search criteria. (search criteria come from the user interface with addressText ng-model)
		if(scope.addressText.length === 0) {  // if the search criteria is not specified, we do not need to search, therefore addressList is empty.
			scope.addressList = []; // addressList shown to the user as suggestions.
		} else {
			scope.addressList =  autoCompletionService.search(scope.currentAddresses,scope.addressText); // if the addressText is not empty, call autoCompletionService
		}
	}

	addressService.findUserCoordinates().then(function(response) {  // get users' current coordinates.
		latitude = response.coords.latitude;
		longitude = response.coords.longitude;

		addressService.findAddressesWithCoordinates(latitude, longitude).then(function(response) {  // find addresses according to user's coordinates
			scope.currentAddresses = [];  // store addresses
			for (var i=0; i < response.results.length; i++) {
				if (scope.currentAddresses.indexOf(response.results[i].formatted_address) < 0) {
					scope.currentAddresses.push(response.results[i].formatted_address);
				}
				for (var j=0; j < response.results[i].address_components.length; j++) {
					if (scope.currentAddresses.indexOf(response.results[i].address_components[j].long_name) < 0) {
						scope.currentAddresses.push(response.results[i].address_components[j].long_name);
					}
				}
			}
		});
	});

	scope.selectCountry = function(index) { // when users select one of the countries from the drop box, the function will be called.
		scope.countryText = scope.countryList[index]; // countryText sets with a country name which is selected by users.
		scope.countryList = [];
	}

	scope.selectAddress = function(index) {// when users select one of the addresses from the drop box, the function will be called.
		scope.addressText = scope.addressList[index];  // addressText sets with a country name which is selected by the user
		scope.addressList = [];
	}

	scope.controlCountryListWithKey = function(event) { // key board control
		if(event.keyCode === 13){ // if users clicks the enter.
			scope.countryText = scope.countryList[scope.selectedCountryIndex]; // set the contryText as the selected
			scope.countryList = []; // countryList sets as empty and will be disappeared.
			scope.selectedCountryIndex = 0;
		}
		if (event.keyCode === 40) { // if users clicks down button
			if((scope.selectedCountryIndex < 5) && (scope.selectedCountryIndex+1 < scope.countryList.length)) { // DropDown size is limited as 6 items, if the user push down after index 5 (6. element), this function will not be called
				scope.selectedCountryIndex++; // increase the selected country index
			}
		} else if (event.keyCode === 38) { // if users click up button
			if(scope.selectedCountryIndex-1 >= 0) {
				scope.selectedCountryIndex--;  // decrease the selected country index.
			}
		} else if(event.keyCode === 8){ //backspace
			if($scope.countryText.length === 1){ // if text lenght is 1, after backspace, text input field will be empty, selectedCountryIndex should be -1,
				scope.selectedCountryIndex = -1;
			}
		}
	}

	scope.controlAddressListWithKey = function(event) { // key board control
		if(event.keyCode === 13){ // if users click the enter.
			scope.addressText = scope.addressList[scope.selectedAddressIndex]; // set the address text as the selected
			scope.addressList = []; // addressList sets as empty and will be disappeared.
			scope.selectedAddressIndex = 0;
		}
		if (event.keyCode === 40) { // if users click down button
			if((scope.selectedAddressIndex < 5) && (scope.selectedAddressIndex+1 < scope.addressList.length)) { // DropDown size is limited as 6 items, if the user push down after index 5 (6. element), this function will not be called
				scope.selectedAddressIndex++; // increase the selected address index
			}
		} else if (event.keyCode === 38) { // if users click up button
			if(scope.selectedAddressIndex-1 >= 0) {
				scope.selectedAddressIndex--; // decrease the selected address index.
			}
		} else if(event.keyCode === 8){ //backspace
			if($scope.addressText.length === 1){ // if text lenght is 1, after backspace, text input field will be empty, selectedAddressIndex should be -1,
				scope.selectedAddressIndex = -1;
			}
		}
	}
}]);
