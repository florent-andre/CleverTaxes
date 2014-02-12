import 'package:polymer/polymer.dart';
import 'package:logging_handlers/logging_handlers_shared.dart';

    @CustomTag( 'mairie-select' )
    class MairieSelect extends PolymerElement 
    {
      
      
      @observable int selected = 0;
       
      final List<String> mairiesList = toObservable(
          ['Paris', 'Nanterre', 'RueilMalmaison', 'Marseille', 'Versailles','Autres...'  ]);
      @observable String value = 'Paris';
      @observable String texte = 'DuTextePourle fun';
      MairieSelect.created() : super.created();
     
      
      void showForm() {
        this.asyncFire('mairie-select');
      }
     
    
    }
