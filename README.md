<a id="readme-top"></a>

# &#127899; Pokemon Gacha API &#127899;

Ini adalah server side Pokemon Gacha, tinggal di clone aja dan ikutin instruksinya untuk menginstall dan seeding datanya ke database

## Server Side Dibuat dengan

[![MongoDB][MongoDB]][MongoDB-url][![Express][Express.js]][Express-url]

###

Agar dapat menjalankan server ini secara lokal, pastikan kalau di device kalian sudah install MongoDB. lalu sisanya tinggal ikutin intruksi dibawah ini.

[Express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[MongoDB]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[Express-url]: https://expressjs.com/
[MongoDB-url]: https://www.mongodb.com/
[demo-url]: https://www.loom.com/share/d5962b1926d24607a61349afaed52d88?sid=22a49585-14fc-4f5f-8659-a939dd847ce5

&nbsp;

## Untuk mulai

- Siapkan folder project, lalu buka terminal di alamat folder tersebut dan lakukan command dibawah ini

```
$ git clone https://github.com/code4space/pokemonGame-backEnd.git
$ cd pokemonGame-backEnd
$ npm install
$ npm start
```

_Disarankan menginstall [Git Bash](https://git-scm.com/downloads) terlebih dahulu_

- buat enviroment varialbenya
```js
// create .env file di root project lalu copy paste isi dari .env.tamplate ke .env yang baru dibuat

$ touch .env // cara buat file .env melalui terminal git

// bisa diatur sesuai setingan masing masing buat jwt tokennya dan mongo URI nya

```

## Cara Seeding data

```js
// Pastikan config server sudah di setup di pokemonGame-backEnd/config/config.json sesuai setingan masing masing

$ ts-node seeders/seed.ts

// == Setelah berhasil
```

&nbsp;

&nbsp;

<p align="right">(<a href="#readme-top">back to top</a>)</p>
