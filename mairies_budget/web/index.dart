import 'dart:html';


void main() {
  querySelector('#oui').onClick.listen(afficheForm);
  
}
void afficheForm(Event e) {
 
  dynamic popupwindow=window.open("index.html","Add information","location=1,status=0,scrollbars=0,width=500,height=400");

 
}