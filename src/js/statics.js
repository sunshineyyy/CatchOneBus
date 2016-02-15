var UI = require('ui');
var Vector2 = require('vector2');
// Create a nice waiting card for user while waiting
var Statics = {}

Statics.welcomeWindow = new UI.Window({ fullscreen: true });
// Create a background Rect
var bgRect = new UI.Rect({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  backgroundColor: 'white'
});
Statics.welcomeWindow.add(bgRect);
var title = new UI.Text({
 position: new Vector2(40, 10),
 size: new Vector2(144, 168),
 font: 'gothic-24-bold',
 text: 'CatchOneBus',
 color: 'black'
});
Statics.welcomeWindow.add(title);
var textfield = new UI.Text({
 position: new Vector2(5, 40),
 size: new Vector2(136, 168),
 font: 'gothic-18-bold',
 text: 'CatchOneBus is now on Facebook and Twitter. Like and follow us! Thanks! :)',
 color: 'black',
 textAlign: 'left'
});
Statics.welcomeWindow.add(textfield);
var image = new UI.Image({
  position: new Vector2(10, 15),
  size: new Vector2(20, 20),
  image: 'images/menu_icon.png'
});
Statics.welcomeWindow.add(image);

// Statics.splashWindow = new UI.Card({
//   title: 'CatchOneBus!',
//   subtitle: "Give us a like or feedback!",
//   body: "Fetching nearby bus stop info for you!"
// });
module.exports = Statics;
