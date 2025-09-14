db = db.getSiblingDB("gamesdb");

db.games.deleteMany({}); 
db.games.insertMany([
  {
    title: "The Legend of Zelda",
    platform: "Switch",
    price: 80,
    rating: 9.5,
    date: 2018
  },
  {
    title: "Mario Kart 8 Deluxe",
    platform: "Switch",
    price: 69.99,
    rating: 9.0,
    date: 2017
  },
  {
    title: "Super Smash Bros. Ultimate",
    platform: "Switch",
    price: 74.99,
    rating: 9.2,
    date: 2018
  }
]);

print("Base de données seedée avec", db.games.countDocuments(), "jeux");