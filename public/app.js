'use strict';

console.log( 'working fine' );

$( '#updateBook' ).hide();
$( '#updateBtn' ).on( 'click',function(){
  $( '#updateBook' ).toggle();
} );
