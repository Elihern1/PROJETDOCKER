db = db.getSiblingDB("gamesdb");

db.games.deleteMany({});

db.games.insertMany([
  {
    title: "The Legend of Zelda: Breath of the Wild",
    platform: "Switch",
    genre: "Adventure",
    price: 79.99,
    date: 2017,          // 👈 Année
    rating: 9.6,
    inStock: true        // 👈 Dispo
  },
  {
    title: "Mario Kart 8 Deluxe",
    platform: "Switch",
    genre: "Racing",
    price: 69.99,
    date: 2017,
    rating: 9.0,
    inStock: true
  },
  {
    title: "Super Smash Bros. Ultimate",
    platform: "Switch",
    genre: "Fighting",
    price: 74.99,
    date: 2018,
    rating: 9.2,
    inStock: false
  },
  {
    title: "Cyberpunk 2077",
    platform: "PC",
    genre: "Action-RPG",
    price: 59.99,
    date: 2020,
    rating: 8.5,
    inStock: true
  },
  {
    title: "Les Sims 4",
    platform: "PC",
    genre: "Simulation",
    price: 49.99,
    date: 2014,
    rating: 8.0,
    inStock: true
  }
]);

print("Base de données seedée avec", db.games.countDocuments(), "jeux");