test( "hello testhh", function() {
ok( 1 == "1", "Passed!" );
});



var estPair = function(nombre) {
 return nombre%2 === 0;
}

test('estPair()', function() {
    ok(estPair(0), '0 est un nombre pair');
    ok(estPair(2), '2 est un nombre pair');
    ok(estPair(-4), '-4 est un nombre pair');
    ok(!estPair(1), '1 nest pas un nombre pair');
    ok(!estPair(-7), '-7 nest pas un nombre pair');
    ok(estPair(3), '3 est un nombre pair'); 
});  

test('assertions', function() { 
    equals( 1, 1, '1 est égal à 1'); 
});  

//deepEqual() et notDeepEqual() permettent de comparer des structures de données Json ou autres
test("deepEqual test", function() {
   deepEqual({ a:1, b:2 }, { a:1, b:2 }, "{ a:1, b:2 } egal a { a:1, b:2 }");
});