/**
@fileOverview

@toc

*/

'use strict';

angular.module('ngSweetAlert', [])
.factory('SweetAlert', [ '$rootScope', function ( $rootScope ) {

	var swal = window.swal;

	//public methods
	var self = {

		swal: function ( arg1, arg2, arg3 ) {
			$rootScope.$evalAsync(function(){
				if( typeof(arg2) === 'function' ) {
					swal( arg1, function(isConfirm){
						$rootScope.$evalAsync( function(){
							arg2(isConfirm);
						});
					}, arg3 );
					exchange();
				} else {
					swal( arg1, arg2, arg3 );
				}
			});
		},
		success: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'success' );
				exchange();
			});
		},
		error: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'error' );
				exchange();
			});
		},
		warning: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'warning' );
				exchange();
			});
		},
		info: function(title, message) {	
			$rootScope.$evalAsync(function(){
				swal( title, message, 'info' );
				exchange();
			});
		}
	};

	function exchange(){
		$('.sa-button-container .cancel').appendTo('.sa-confirm-button-container');
		$('.sa-confirm-button-container .confirm').prependTo('.sa-button-container');

		//确保右上角关闭按钮存在
		var $closeImg = $('.sweet-alert').find('.close-img');
		if($closeImg.size() <= 0){
			$('.sweet-alert').append("<img src='./editingCenter/app/toBeCompiled/images/cls.jpg' class='close-img'/>");
			$closeImg = $('.sweet-alert').find('.close-img');
			$closeImg.click(function(){
				swal.close();
			});
		}		
	}
	
	return self;
}]);
