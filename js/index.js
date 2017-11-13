// Obtain reference to important DOM elements
const canvasArea = document.getElementById('canvas-area');
const $canvasArea = $(canvasArea);
const $userScriptEditor = $('#user-script-editor');
const $userScriptForm = $('#user-script-form');
const $userScriptTracer = $('#user-script-tracer');
const $runButton = $('#run-button');
const $worldSelector = $('#worldSelector');
const $numberLines = $('#numberLines');
var lineNumber = 1;
const $rotateCameraBtn = $('#rotate-camera-btn');
const $translateCameraBtn = $('#translate-camera-btn');

const world = worldFactory({
  homeElement: canvasArea,
  scriptEditorElement: $userScriptEditor,
  robotOptions: {
    initialX: 0,
    initialY: 13,
    imgPath: "img/carlos.png"
  },
  terrainOptions: {
    image: "img/rock.png",
    terrainModel: mazeTerrainModelGenerator(15, 15)
  },
  targetOptions: {
    x: 14,
    y: 0,
    z: 1,
    color: 0x0000ff
  }
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

$userScriptEditor.on('focus change keyup paste',function(event){
    let text = $userScriptEditor.val();
    let numberOfLineBreaks = (text.match(/\n/g) || []).length + 1;
    let div_ = "<div style='line-height: 1.5;'>"
    $numberLines.empty();
    for(let i = 0; i < numberOfLineBreaks; i++){
      $numberLines.append(div_ + (i + 1) + "</div>")
    }
});

$userScriptEditor.scroll(function(){
  $numberLines.scrollTop($(this).scrollTop());
});



$userScriptForm.on('submit', (event) => {
  event.preventDefault();

  const userScript = $userScriptEditor.val();
  world.compileUserScript(userScript);

  $userScriptForm.hide();

  if (!isAnimated) {

    try {
      world.run(traceProgram);
      isAnimated = true;
    } catch(error) {
      if (error.code === 1) {
        alert('The program crashed because you attempted to move the robot wrong.');
      } else {
        alert('The program crashed with an uknown error.');
      }
    }

  }

});

let clickClientX;
let clickClientY;
let dragging = false;
let rotateEnabled = false;
let translateEnabled = false;

$rotateCameraBtn.on('click', function() {
  translateEnabled = false;
  rotateEnabled = true;
});
$translateCameraBtn.on('click', function() {
  rotateEnabled = false;
  translateEnabled = true;
});

$canvasArea.on('mousedown', function(event) {
  dragging = true;
  clickClientX = event.clientX;
  clickClientY = event.clientY;
});

$canvasArea.on('dragover', function(event) {
  let deltaX = event.clientX - clickClientX;
  let deltaY = event.clientY - clickClientY;

  if (rotateEnabled) {
    if (dragging) {
      world.rotateCamera('z', (deltaX/400) * 360);
      world.rotateCamera('x', (deltaY/400) * 360);
    }
  } else if (translateEnabled) {
    world.panCamera('x', -deltaX / 10);
    world.panCamera('y', deltaY / 10);

    clickClientX += deltaX;
    clickClientY += deltaY;
  }
  world.render();
});

$canvasArea.on('mouseup', function(event) {
  dragging = false;
  clickClientX = 0;
  clickClientY = 0;
});
