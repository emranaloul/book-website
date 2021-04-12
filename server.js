'use strict';

const express = require( 'express' );
const superagent = require( 'superagent' );

require( 'dotenv' ).config();

const cors = require( 'cors' );
const pg = require( 'pg' );

const server = express();
server.use( cors() );
const PORT = process.env.PORT || 3000;
server.set( 'view engine', 'ejs' );
server.use( express.static( './public' ) );

server.get( '/searches/show', dataHandler );

server.get( '/', ( req,res )=>{
  res.render( './pages/index' );
} );
// console.log('how r u');
server.get( '/searches/new', ( req,res )=>{
  res.render( './pages/searches/new' );

} );

function dataHandler( req,res ) {

  let search = req.query.authorOrTitle;
  let select = req.query.select;
  let URL = `https://www.googleapis.com/books/v1/volumes?q=+in${select}:${search}`;

  superagent.get( URL )
    .then( result =>{
      let bookArr = result.body.items.map( element=>{
        return new Book ( element );
      } );
      res.render( 'pages/searches/show',{bookDetails: bookArr} );
    } );
}

function Book( bookDetails ){

  this.title = bookDetails.volumeInfo.title;
  this.author = bookDetails.volumeInfo.authors[0];
  this.description = bookDetails.volumeInfo.description;
  this.image = bookDetails.volumeInfo.imageLinks.thumbnail;

}

server.listen( PORT, ()=>{
  console.log( `listening on PORT ${PORT}` );
} );





