exports.getHome = (req, res) => {
  const restaurants = [
    { name: 'Sonam Eatery', cuisine: 'Bhutanese', rating: 4.5 },
    { name: 'Zangmo Diner', cuisine: 'Indian', rating: 4.2 },
    { name: 'Highland Cafe', cuisine: 'Continental', rating: 4.7 },
    { name: 'Druk Momo House', cuisine: 'Tibetan', rating: 4.6 },
  ];

  res.render('index', { title: 'Campus Eats', restaurants });
};

