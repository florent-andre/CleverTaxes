
import 'package:json_object/json_object.dart';

class budgetLine   {
  
  int _id;  //private field
  String label;
  String amount;
  double percent;
  
  int get id => _id; // getter
  
  set id(value) => _id = value; // setter

  budgetLine(id) : this._id = id;
 String toString(){
   return "id="+_id.toString()+" ; label = "+label +" ; amonut="+amount.toString()+" ; percent = "+percent.toString();
 }
 void main(){
   var b = new budgetLine(8);
   b.label = "Mr Smith";
   b.amount = "30";
  
   var json = objectToJson(b);  // Here is the magic

   print(json); // Valid JSON
 }
  
}

class budgetFactory {
  
  static int _currentId = 1;
  
  static budgetLine getNewBudgetLine(){
    var r = new budgetLine(_currentId);
    _currentId += 1;
    return r;
  }
  
  
}

