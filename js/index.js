// Obtain reference to important DOM elements
const canvasArea = document.getElementById('canvas-area');
const $userScriptEditor = $('#user-script-editor');
const $userScriptForm = $('#user-script-form');
const $userScriptTracer = $('#user-script-tracer');
const $runButton = $('#run-button');
const $worldSelector = $('#worldSelector');

var world = worldFactory({
  homeElement: canvasArea,
  scriptEditorElement: $userScriptEditor,
  terrainOptions: {
     image: 'img/rock.png',
     terrainModel: flatTerrainModelGenerator(15, 15),
  },
  robotOptions: {imgPath: 'img/carlos.png'}
});

// An initial call to render is done so that the user can visualize the
// terrain and therefore know what they have to write in their script
world.render();

let isAnimated = false;

const instructions_ps = [];
function traceProgram(instructions, currentIndex) {
  if ($userScriptTracer.children().length === 0) {
    // The instructions haven't been displayed yet
    instructions.forEach((instruction) => {
      const inst = $('<p></p>');
      inst.text(instruction);
      instructions_ps.push(inst);
      $userScriptTracer.append(inst);
    });
  }

  $userScriptTracer.children().css('backgroundColor', 'white');
  $userScriptTracer.children().css('color', 'black');

  instructions_ps[currentIndex].css('backgroundColor', 'green');
  instructions_ps[currentIndex].css('color', 'yellow');
}

$worldSelector.change(function(){
  console.log('Inside selector');
  const newTerrainImg = $worldSelector.val();
  world.update(
    "terrain", 
    {
      terrainModel: flatTerrainModelGenerator(15, 15),
      image: newTerrainImg
    });
});

$userScriptForm.on('submit', (event) => {
  event.preventDefault();

  const userScript = $userScriptEditor.val();
  world.compileUserScript(userScript);

  $userScriptForm.hide();

  if (!isAnimated) {
    world.run(traceProgram);
    isAnimated = true;
  }

});
