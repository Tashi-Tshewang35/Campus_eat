 exports.getMenu = (req, res) => {
  const menuItems = [
    { name: 'Ema Datshi', price: 120 },
    { name: 'Momos', price: 80 },
    { name: 'Thukpa', price: 100 },
    { name: 'Fried Rice', price: 90 },
    { name: 'Red Rice Set Meal', price: 150 },
  ];

  res.render('menu', { title: 'Menu — Campus Eats', menuItems });
};

