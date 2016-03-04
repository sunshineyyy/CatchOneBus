var UI = require('ui');
var Vector2 = require('vector2');
// Create a nice waiting card for user while waiting
var Detail = {}

Detail.add = function(title_text, text) {
  var page = new UI.Window({ fullscreen: true });
  // Create a background Rect
  var bgRect = new UI.Rect({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    backgroundColor: 'white'
  });
  page.add(bgRect);
  var image = new UI.Image({
    position: new Vector2(10, 15),
    size: new Vector2(20, 20),
    image: 'images/menu_icon.png'
  });
  page.add(image);
  var title = new UI.Text({
   position: new Vector2(40, 10),
   size: new Vector2(144, 168),
   font: 'gothic-24-bold',
   text: title_text,
   color: 'black'
  });
  page.add(title);
  var textfield = new UI.Text({
   position: new Vector2(5, 40),
   size: new Vector2(136, 168),
   font: 'gothic-24-bold',
   text: text,
   color: 'black',
   textAlign: 'left'
  });
  page.add(textfield);
  return page;
}
module.exports = Detail;
