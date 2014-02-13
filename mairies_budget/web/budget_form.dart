import 'dart:html';
import 'dart:convert';

import 'package:polymer/polymer.dart';
import 'budget_line.dart';
import 'package:logging_handlers/logging_handlers_shared.dart';

var lignes;
String BudgetLinesAsJsonData;

@CustomTag('budget-form')
class FormBudget extends FormElement with Polymer, Observable {
  
  FormBudget.created() : super.created();
  
  @observable List  lines = toObservable([budgetFactory.getNewBudgetLine()]);
  @observable var annee;
  @observable String mairie = "";
  @observable String serverResponse = '';
  
  HttpRequest request;
  
  void addNewLigne(){
    
    lines.add(budgetFactory.getNewBudgetLine());
  }
  void submitForm(Event e, var detail, Node target) {
    e.preventDefault(); // Don't do the default submit.
    startQuickLogging();
    
   // TODO : Add control input element
   
    if (!this.checkValidity()) {
      info (this.checkValidity().toString());
      return;
    } 
    
    info (lines.length.toString());
   //remove blank line
    lines.removeWhere((budgetLine bl) => bl.isEmpty() == true);
    info (lines.length.toString());
   
   //calcul percent
    var tot = 0;
    lines.forEach((budgetLine bl){
      if (bl.amount != null)
      //if (int.parse(bl.amount) != 0)
            tot+=int.parse(bl.amount);
      });
    if (tot != 0){
      lines.forEach((budgetLine bl){
        if (bl.amount != null)
          bl.percent = int.parse(bl.amount)/tot;
      });     
    }
  //Construire les donnees en format JSON 
      BudgetLinesAsJsonData = "[";
      
      lines.forEach((budgetLine bl) =>  BudgetLinesAsJsonData += bl.toJson() );
      
      BudgetLinesAsJsonData += "]";
      //''' multi-line string
      serverResponse = ''' [annee: '$annee', mairie : '$mairie'], 
        $BudgetLinesAsJsonData ''';
   // info(BudgetLinesAsJsonData); // Valid JSON
  
    /*
    request = new HttpRequest();
    
    request.onReadyStateChange.listen(onData); 
    
    // POST the data to the server.
    var url = 'http://127.0.0.1:4040';
    request.open('POST', url);
 
   request.send(BudgetLinesAsJsonData);
  */
  }
  
  bool  checkValidity(){
    /* 
    if ((this.mairie == null) || (this.mairie.length == 0)){
      return false;
    }
    
    if ((this.annee == null) || (this.annee == 0))
      return false;
  
    lines.forEach((budgetLine bl){
      if (!bl.amount.isNaN)
        return false;
      }); */
    return true;
  }
  void hideForm(Event e, var detail, Node target) {
    $['container'].style.display = 'none';
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
    startQuickLogging();
    e.preventDefault(); // Default behavior clears elements,
                        // but bound values don't follow
                        // so have to do this explicitly.
    lines.removeWhere((budgetLine bl) => bl.isEmpty() == true);
    lines.forEach((budgetLine bl){
      bl.reset();
    });
    this.annee = "";
    this.mairie = "";

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
    input2.id = "amount$nbLignes";
    
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