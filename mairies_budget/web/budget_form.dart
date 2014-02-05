import 'dart:html';
import 'dart:convert';
import 'package:json_object/json_object.dart';
import 'package:polymer/polymer.dart';
import 'budget_line.dart';
import 'package:logging_handlers/logging_handlers_shared.dart';

var lignes;


@CustomTag('budget-form')
class FormBudget extends FormElement with Polymer, Observable {
  
  FormBudget.created() : super.created();
  
  @observable List  lines = toObservable([budgetFactory.getNewBudgetLine()]);
  @observable String annee = "";
  @observable String serverResponse = '';
  
  HttpRequest request;
  
  void addNewLigne(){
    lines.add(budgetFactory.getNewBudgetLine());
  }
  void submitForm(Event e, var detail, Node target) {
    startQuickLogging();
    //calcul percent
    var tot = 0;
   
    lines.forEach((budgetLine bl){ 
      if (!(bl.amount.isEmpty))
            tot+=int.parse(bl.amount);
      });
    if (tot != 0)
      lines.forEach((budgetLine bl) => bl.percent = int.parse(bl.amount)/tot);
    
   
   
    budgetLine bl = budgetFactory.getNewBudgetLine();
    bl.label ="tetcc";
    info(bl.toString());
    var json = objectToJson(bl);  // Here is the magic

    info(json); // Valid JSON
   /* 
    List <budgetLine> liste;
    liste = new List <budgetLine>() ;
    liste.add(bl);
   
    info(JSON.encode(liste));
    */
    
    //var json = objectToJson(b);  // Here is the magic
  //  objectToJson(b).then((jsonStr) => print(jsonStr));
   // print(json); // Valid JSON
    //JsonEncoder je = new JsonEncoder(lines);
    //print(je.convert);
   // lines.forEach((Element b) => print (b.toString()));
   //print(lines.forEach(budgetLine b => b.to));
    
    e.preventDefault(); // Don't do the default submit.
  
    request = new HttpRequest();
    
    request.onReadyStateChange.listen(onData); 
    
    // POST the data to the server.
    var url = 'http://127.0.0.1:4040';
    request.open('POST', url);
  
     
   
   // request.send(_slambookAsJsonData());

  }
  
  void onData(_) {
    if (request.readyState == HttpRequest.DONE &&
        request.status == 200) {
      // Data saved OK.
      serverResponse = 'Server Sez: ' + request.responseText;
    } else if (request.readyState == HttpRequest.DONE &&
        request.status == 0) {
      // Status is 0...most likely the server isn't running.
      serverResponse = 'No server';
    }
  }
  
  
  
  
  void resetForm(Event e, var detail, Node target) {
    e.preventDefault(); // Default behavior clears elements,
                        // but bound values don't follow
                        // so have to do this explicitly.
    lines.forEach((element) => element = "");
      
    serverResponse = 'Data cleared.';
  }
 
  String _slambookAsJsonData() {
   
    
    return JSON.encode(lines);
  }
  /*
  String getValue (String id){
    InputElement input = $[id];
    return input.value;
  }
  void addLigne (){
   
    lignes = $['lignes'];
    int nbLignes = 1;
    lignes.children.forEach((Element el) {
      if (el is LIElement)
        nbLignes ++;
    });
    
    LabelElement label1 = new LabelElement();
    label1.text = "Intitule";
    LabelElement label2 = new LabelElement();
    label2.text = "Montant";
    
    InputElement input1 = new Element.tag("input");
    input1.type = "text";
    input1.id = "label"+nbLignes.toString();
    
    InputElement input2 = new Element.tag("input");
    input2.type = "text";
    input2.id = "amount"+nbLignes.toString();
    
    LIElement li = new LIElement();
    li.append(label1);
    li.append(input1);
    lignes.children.add(li);
    //lignes.children.add(label1);
    //lignes.children.add(input1);
    lignes.children.add(label2);
    lignes.children.add(input2);
    
    
   
  }*/
  
}