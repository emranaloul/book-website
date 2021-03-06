'use strict';

const express = require( 'express' );
const superagent = require( 'superagent' );

require( 'dotenv' ).config();

const cors = require( 'cors' );
const pg = require( 'pg' );
const { get } = require( 'superagent' );
const methodOverride = require('method-override');



const server = express();
server.use( cors() );
const PORT = process.env.PORT || 3000;
server.set( 'view engine', 'ejs' );
server.use( express.static( './public' ) );
server.use(methodOverride('_method'));

// const client = new pg.Client( process.env.DATABASE_URL );
const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false}} );


server.use( express.urlencoded( {extended:true} ) );
server.post( '/searches/show', dataHandler );

server.get( '/', ( req,res )=>{
  let SQL = 'SELECT * FROM books;';
  client.query( SQL )
    .then( result=>{
      res.render( 'pages/index',{bookDetails: result.rows} );
    } );
} );

server.get( '/searches', ( req,res )=>{
  res.render( './pages/searches/new' );

} );

server.post( '/books', ( req,res )=>{
  let {title,author,isbn,description,image} = req.body;
  let SQL = 'INSERT INTO books (title,author,isbn,description,image) VALUES ($1,$2,$3,$4,$5) RETURNING *;';
  // let safeValues =
  let safeValue = [title,author,isbn,description,image];
  console.log( safeValue );
  client.query( SQL, safeValue )
    .then( result =>{
      res.redirect( `/books/${result.rows[0].id}` );
      // res.render( 'pages/books/detail', {bookDetails:result.rows[0]} );
    } );
} );

server.get( '/books/:id', ( req,res )=>{
  console.log( req.params );
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query( SQL , safeValue )
    .then( result =>{
      res.render( 'pages/books/detail', {bookDetails:result.rows[0]} );

    } );
} );

// server.get( '/books/show', ( req,res )=>{
//   res.render( 'pages/books/detail' );
// } );

function dataHandler( req,res ) {

  let search = req.body.authorOrTitle;
  let select = req.body.select;
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
  this.author = bookDetails.volumeInfo.authors;
  this.isbn = bookDetails.volumeInfo.industryIdentifiers[0].identifier;
  this.description = bookDetails.volumeInfo.description;
  this.image = ( bookDetails.volumeInfo.imageLinks ) ? bookDetails.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';

}

server.put( '/updatebook/:id', ( req,res )=>{
  console.log( 'you are here' )
  let {title,author,isbn,description} = req.body;
  let SQL = `UPDATE books SET title=$1,author=$2,isbn=$3,description=$4 WHERE id=$5;`;
  let safeValues = [title,author,isbn,description,req.params.id];
  client.query( SQL, safeValues )
    .then( ()=>{
      res.redirect( `/books/${req.params.id}` );
    } );
} );

server.delete('/deletebook/:id', (req,res)=>{
  let SQL =`DELETE FROM books WHERE id=$1;`;
  let safeValue = [req.params.id];
  client.query(SQL, safeValue)
  .then(()=>{
    res.redirect('/');
  })
})

server.get( '*', ( req,res )=>{
  res.render( 'pages/error' );
} );



client.connect()
  .then( () => {
    server.listen( PORT, ()=>{
      console.log( `listening on PORT ${PORT}` );
    } );
  } );






