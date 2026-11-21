window.LW = window.LW || {};

LW.MODELS = {
  burger: 'food/burger.glb', pizza: 'food/pizza.glb', donut: 'food/donut.glb', sandwich: 'food/sandwich.glb',
  salad: 'food/salad.glb', fries: 'food/fries.glb', hotdog: 'food/hot-dog.glb', coffee: 'food/cup-coffee.glb',
  milk: 'food/carton.glb', cheese: 'food/cheese.glb', bread: 'food/bread.glb', apple: 'food/apple.glb',
  banana: 'food/banana.glb', soup: 'food/bowl-soup.glb', cake: 'food/cake-birthday.glb', rice: 'food/rice-ball.glb',
  noodles: 'food/chinese.glb', sushi: 'food/sushi-salmon.glb', chocolate: 'food/chocolate.glb', pudding: 'food/pudding.glb',
  candy: 'food/candy-bar.glb', cookie: 'food/cookie.glb', orange: 'food/orange.glb', grapes: 'food/grapes.glb',
  strawberry: 'food/strawberry.glb', watermelon: 'food/watermelon.glb', pineapple: 'food/pineapple.glb', coconut: 'food/coconut.glb',
  lemon: 'food/lemon.glb', pear: 'food/pear.glb', cherry: 'food/cherries.glb', avocado: 'food/avocado.glb',
  broccoli: 'food/broccoli.glb', pepper: 'food/paprika.glb', taco: 'food/taco.glb', pancake: 'food/pancakes.glb',
  bacon: 'food/bacon.glb', steak: 'food/meat-cooked.glb', fish: 'food/fish.glb', water: 'food/glass.glb',
  tea: 'food/cup-tea.glb', soda: 'food/soda-can.glb', spoon: 'food/utensil-spoon.glb', croissant: 'food/croissant.glb',
  carrot: 'food/carrot.glb', tomato: 'food/tomato.glb', onion: 'food/onion.glb', pumpkin: 'food/pumpkin.glb',
  corn: 'food/corn.glb', egg: 'food/egg.glb', honey: 'food/honey.glb', tractor: 'cars/tractor.glb',
  bed: 'furniture/bedSingle.glb', sofa: 'furniture/loungeSofa.glb', chair: 'furniture/chair.glb', lamp: 'furniture/lampRoundTable.glb',
  shower: 'furniture/shower.glb', mirror: 'furniture/bathroomMirror.glb', television: 'furniture/televisionModern.glb', table: 'furniture/table.glb',
  wardrobe: 'furniture/bookcaseClosedDoors.glb', shelf: 'furniture/bookcaseOpen.glb', pillow: 'furniture/pillow.glb', toilet: 'furniture/toilet.glb',
  sink: 'furniture/bathroomSink.glb', fridge: 'furniture/kitchenFridge.glb', oven: 'furniture/kitchenStove.glb', bowl: 'food/bowl.glb',
  glass: 'food/glass-wine.glb', fork: 'food/utensil-fork.glb', knife: 'food/utensil-knife.glb', pot: 'food/pot.glb',
  laundry: 'furniture/washer.glb', stairs: 'furniture/stairs.glb', box: 'furniture/cardboardBoxClosed.glb', fan: 'furniture/ceilingFan.glb',
  bin: 'furniture/trashcan.glb', door: 'furniture/doorway.glb',
  desk: 'furniture/desk.glb', book: 'furniture/books.glb', computer: 'furniture/computerScreen.glb', keyboard: 'furniture/computerKeyboard.glb',
  mouse: 'furniture/computerMouse.glb', speaker: 'furniture/speaker.glb', radio: 'furniture/radio.glb', robot: 'characters/character-robot.glb',
  bench: 'furniture/bench.glb', building: 'commercial/building-a.glb', skyscraper: 'commercial/building-skyscraper-a.glb',
  taxi: 'cars/taxi.glb', car: 'cars/sedan.glb', suitcase: 'characters/item-luggage.glb', tent: 'nature/tent_smallClosed.glb',
  ambulance: 'cars/ambulance.glb', wheelchair: 'characters/wheelchair.glb', glasses: 'characters/aid-glasses.glb', sunglasses: 'characters/aid-sunglasses.glb',
  tree: 'nature/tree_default.glb', mushroom: 'nature/mushroom_red.glb', log: 'nature/log.glb', rock: 'nature/rock_largeA.glb',
  flower: 'nature/flower_redA.glb', fire: 'nature/campfire_logs.glb', plant: 'furniture/pottedPlant.glb',
  soldier: 'characters/character-soldier.glb'
};

LW.hasModel = function (w) { return !!LW.MODELS[typeof w === 'string' ? w : w.en]; };
