/*Here the tickets are seeded in to the database using mongoose*/

var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shop'); //db connection

//Ticket details storing in db
var products = [
    new Product({
        imagePath: 'http://www.bestoflanka.com/images/dont-miss-when-in-sri-lanka/visit-to-kandy-sacred-city/08.jpg',
        title: 'Colombo-Kandy',
        description: '1030 - Intercity Express',
        price: 700
    }),
    new Product({
        imagePath: 'https://www.asianmirror.lk/media/k2/items/cache/610ffdc3f8bd82cb781ff35b8cc7fce3_XL.jpg',
        title: 'Colombo-Badulla',
        description: '1015 - Udarata Menike',
        price: 'Rs.850'
    }),
    new Product({
        imagePath: 'http://srilankanexpeditions.com/location_img/1455075583khguyf.jpg',
        title: 'Colombo-Batticalo',
        description: '6011 - Udaya Devi',
        price: 800
    }),
    new Product({
        imagePath: 'https://worldtravelfamily.com/wp-content/uploads/2016/05/Lets-go-to-Jaffna.jpg',
        title: 'Colombo-Jaffna',
        description: '4077 - Yaldevi',
        price: 950
    }),
    new Product({
        imagePath: 'https://t-ec.bstatic.com/images/hotel/max1280x900/591/59178304.jpg',
        title: 'Colombo-Matara',
        description: '50 - 8003 - Express',
        price: 650
    }),
    new Product({
        imagePath: 'https://media.holidayme.com/wp-content/uploads/2016/03/23153835/Koneswaram-Temple-also-use-as-banner.jpg',
        title: 'Colombo-Trinco',
        description: '4077 - Yaldevi',
        price: 850
    }),
    new Product({
        imagePath: 'https://cdn2.veltra.com/ptr/20180608033151_1411982644_13948_0.jpg?imwidth=550&impolicy=custom',
        title: 'Colombo-Anuradapura',
        description: '4018 - Uththara Devi',
        price: 650
    }),
    new Product({
        imagePath: 'https://photos.wikimapia.org/p/00/03/22/09/60_big.jpg',
        title: 'Colombo- Kankesanthura',
        description: '4021 - AC Intercity',
        price: 1500
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect(); //disconnecting db
}