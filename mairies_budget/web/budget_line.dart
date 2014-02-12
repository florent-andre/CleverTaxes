


class budgetLine   {
  
  int _id;  //private field
  String label;
  var amount;
  double percent;
  
  int get id => _id; // getter
  
  set id(value) => _id = value; // setter

  budgetLine(id) : this._id = id;
 String toString(){
   return "id=$_id ; label = '$label'  ; amount=$amount ; percent = $percent";
 }
 
 String toJson(){
   return "{id : $_id, label : '$label' , amount : $amount ,percent : $percent },";
 }
 /*
void reset(){
  this.label = "";
  }
*/ 
  
}

 class budgetFactory {
  
   static int _currentId = 1;
  
   static budgetLine getNewBudgetLine(){
    var r = new budgetLine(_currentId);
    _currentId += 1;
    return r;
  }
  
  
}

