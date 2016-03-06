var UI = require('ui');
var Vector2 = require('vector2');
// Create a nice waiting card for user while waiting
var Detail = {}

Detail.add = function(title_text, text) {
  var page = new UI.Window({ fullscreen: false, scrollable: true });
  // Create a background Rect
  var bgRect = new UI.Rect({
    position: new Vector2(0, 0),
    size: new Vector2(144, 230),
    backgroundColor: 'white'
  });
  page.add(bgRect);
  var image = new UI.Image({
    position: new Vector2(10, 10),
    size: new Vector2(15, 15),
    image: 'images/menu_icon.png'
  });
  page.add(image);
  var title = new UI.Text({
   position: new Vector2(35, 5),
   size: new Vector2(109, 12),
   font: 'gothic-18-bold',
   text: title_text,
   textOverflow:'wrap',
   color: 'black'
  });
  page.add(title);
  var textfield = new UI.Text({
   position: new Vector2(3, 30),
   size: new Vector2(136, 200),
   font: 'gothic-18-bold',
   text: text,
   textOverflow:'wrap',
   color: 'black',
   textAlign: 'left'
  });
  page.add(textfield);
  return page;
}
module.exports = Detail;
