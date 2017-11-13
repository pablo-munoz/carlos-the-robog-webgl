"use strict";

// world.js
//
// This file exports a constructor capable of creating world objects.
// World objects represent the "terrain" that an execution of a Karel
// program will take place in.
// World objects are composed of cubes, where each cube is identifierd
// by an x, y, and z coordinate. Note that these values of these cordinates
// are not related to the 1,1,1 "cube" that a WebGL scene takes place in, rather,
// they are "grid" coordinates, and are always integers.
//
// These file also exports some world constructors that have been
// particularized to create some predefined worlds.

// Constants used throughout the application
const MOVE_FORWARD = "MOVE_FORWARD";
const TURN_LEFT = "TURN_LEFT";
const TURN_RIGHT = "TURN_RIGHT";
const GOTO = "GOTO";
const WHILE = "WHILE";
const ENDWHILE = "ENDWHILE";
const IF = "IF";
const ELSE = "ELSE";
const ENDIF = "ENDIF";
const TRUE = "TRUE";
const FALSE = "FALSE";
const FRONT_IS_BLOCKED = "FRONT_IS_BLOCKED";
const FRONT_IS_NOT_BLOCKED = "FRONT_IS_NOT_BLOCKED";
const NORTH_IS_BLOCKED = "NORTH_IS_BLOCKED";
const NORTH_IS_NOT_BLOCKED = "NORTH_IS_NOT_BLOCKED";
const WEST_IS_BLOCKED = "WEST_IS_BLOCKED";
const WEST_IS_NOT_BLOCKED = "WEST_IS_NOT_BLOCKED";
const SOUTH_IS_BLOCKED = "SOUTH_IS_BLOCKED";
const SOUTH_IS_NOT_BLOCKED = "SOUTH_IS_NOT_BLOCKED";
const EAST_IS_BLOCKED = "EAST_IS_BLOCKED";
const EAST_IS_NOT_BLOCKED = "EAST_IS_NOT_BLOCKED";
const ROBOT_IS_ON_TARGET = "ROBOT_IS_ON_TARGET";
const ROBOT_IS_NOT_ON_TARGET = "ROBOT_IS_NOT_ON_TARGET";
const ROBOT_IS_FACING_NORTH = "ROBOT_IS_FACING_NORTH";
const ROBOT_IS_FACING_WEST = "ROBOT_IS_FACING_WEST";
const ROBOT_IS_FACING_SOUTH = "ROBOT_IS_FACING_SOUTH";
const ROBOT_IS_FACING_EAST = "ROBOT_IS_FACING_EAST";

const NORTH = 0;
const WEST = 1;
const SOUTH = 2;
const EAST = 3;

const INVALID_ROBOT_MOVE_ATTEMPT = 1;
// End of constants

// Helper higher order functions
// See the world.run() method to see why these are needed
const timeSmoothUnaryFunctionFactory = (unaryFunc, onlyArg, callback) => {
  // unaryFunc is a functio that takes a single, numeric argument.
  // onlyArg is the numeric value that we want to be amortized over a
  //   1 second period.
  // callback is a function to call when the time period has completed.
  // Returns a function that accepts as its only argument a number of milliseconds,
  // then calls the unaryFunction with a numeric argument proportional to the
  // number of given milliseconds to a full second. Calling the created function
  // a number of times untill their accumulated  milliseconds they equal one second
  // is the equivalent to calling the original function once. The function call
  // does nothing once the accumulated milliseconds exceed 1 full second.
  callback = callback || _.noop;
  return () => {
    let totalMilliseconds = 0;
    let amortizedUnaryArg = 0;

    return function(millisecondsDelta) {
      if (totalMilliseconds >= 1000) {
        return;
      }

      if (totalMilliseconds + millisecondsDelta < 1000) {
        unaryFunc(onlyArg * (millisecondsDelta / 1000));
        amortizedUnaryArg += onlyArg * (millisecondsDelta / 1000);
        totalMilliseconds += millisecondsDelta;
      } else {
        callback();
        totalMilliseconds = 1000;
        amortizedUnaryArg = onlyArg - amortizedUnaryArg;
        unaryFunc(amortizedUnaryArg);
      }
    };
  };
}

const callableOnlyOnceFunctionFactory = func => {
  return () => {
    // func is a function
    // Returns a function that calls the given function only once. Further
    // calls to the created function do nothing.
    let alreadyCalled = false;

    return (millisecondsDelta, args) => {
      if (alreadyCalled) {
        return;
      } else {
        func(args);
        alreadyCalled = true;
      }
    };
  };
};
// End of helper higher order functions

// Robot objects are spheres, whose purpose is to move around a terrain.
const robotFactory = options => {
  options = _.defaults({}, options, {
    directionFacingAt: NORTH,
    initialX: 0.3,
    initialY: 0.3,
    initialZ: 1,
    radius: 1,
    density: 32,
    initialScale: 0.5,
    initialColor: 0xff0000,
    imgPath: ""
  });

  const {
    radius,
    density,
    initialX,
    initialY,
    initialZ,
    initialScale,
    initialColor,
    imgPath
  } = options;

  let x = initialX;
  let y = initialY;
  let z = initialZ;

  let { directionFacingAt } = options;

  const geometry = new THREE.BoxGeometry(2, 2, 0);
  geometry.scale(initialScale, initialScale, 0);
  var material;
  if (imgPath !== "") {
    const texture = new THREE.TextureLoader().load(imgPath);
    material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    texture.needsUpdate = true;
  } else {
    material = new THREE.MeshBasicMaterial({ color: initialColor });
  }

  const robot = new THREE.Mesh(geometry, material);
  robot.position.x = initialX;
  robot.position.y = initialY;
  robot.position.z = initialZ;

  const addToScene = scene => {
    scene.add(robot);
  };

  const turnLeft = () => {
    directionFacingAt = (directionFacingAt + 1) % 4;
  };

  const turnRight = () => {
    directionFacingAt = (directionFacingAt + 3) % 4;
    console.log('turnRight called');
  };

  const move = distance => {
    console.log(directionFacingAt);
    switch (directionFacingAt) {
      case NORTH:
        robot.position.y += distance;
        break;
      case SOUTH:
        robot.position.y -= distance;
        break;
      case WEST:
        robot.position.x -= distance;
        break;
      case EAST:
        robot.position.x += distance;
        break;
    }
  };

  const rotateRight = (amount) => {
    robot.rotation.z -= Math.PI * amount / 180;
  };

  const rotateLeft = (amount) => {
    robot.rotation.z += Math.PI * amount / 180;
  };

  const getCurrentCoordinates = () => {
    return {
      x,
      y,
      z
    };
  };

  const getCoordinatesInFront = () => {
    const inFrontCoordinates = getCurrentCoordinates();

    switch (directionFacingAt) {
      case NORTH:
        inFrontCoordinates.y += 1;
        break;
      case SOUTH:
        inFrontCoordinates.y -= 1;
        break;
      case WEST:
        inFrontCoordinates.x -= 1;
        break;
      case EAST:
        inFrontCoordinates.x += 1;
        break;
    }

    /* inFrontCoordinates.x = Math.floor(inFrontCoordinates.x);
     * inFrontCoordinates.y = Math.floor(inFrontCoordinates.y);
     * inFrontCoordinates.z = Math.floor(inFrontCoordinates.z);*/

    return inFrontCoordinates;
  };

  const isFacingNorth = () => {
    return directionFacingAt === NORTH;
  };

  const isFacingWest = () => {
    return directionFacingAt === WEST;
  };

  const isFacingSouth = () => {
    return directionFacingAt === SOUTH;
  };

  const isFacingEast = () => {
    return directionFacingAt === EAST;
  };

  const advancePosition = () => {
    switch (directionFacingAt) {
      case NORTH:
        y += 1;
        break;
      case SOUTH:
        y -= 1;
        break;
      case WEST:
        x -= 1;
        break;
      case EAST:
        x += 1;
        break;
    }
  };

  return Object.freeze({
    addToScene,
    turnLeft,
    turnRight,
    move,
    getCurrentCoordinates,
    getCoordinatesInFront,
    isFacingNorth,
    isFacingWest,
    isFacingSouth,
    isFacingEast,
    advancePosition,
    rotateLeft,
    rotateRight
  });
};

const targetFactory = options => {
  _.defaults(options, {
    x: 14,
    y: 0,
    z: 1,
    color: 0x0000ff
  });

  const { x, y, z, color } = options;

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  geometry.scale(0.5, 0.5, 0.2);

  const material = new THREE.MeshBasicMaterial({ color: color });
  const target = new THREE.Mesh(geometry, material);

  target.position.x = x;
  target.position.y = y;
  target.position.z = z;

  const addToScene = scene => {
    scene.add(target);
  };

  return Object.freeze({
    addToScene
  });
};

// Generates an array of coordianets that when fed to the terrainFactory()
// function produce a rectangular terrain where all the cubes are at the
// same altitude.
const flatTerrainModelGenerator = (numHorizontal, numVertical) => {
  const model = [];

  for (
    let horizontalIndex = 0;
    horizontalIndex < numHorizontal;
    horizontalIndex++
  ) {
    for (let verticalIndex = 0; verticalIndex < numVertical; verticalIndex++) {
      model.push({
        x: horizontalIndex,
        y: verticalIndex,
        z: 0
      });
    }
  }

  return model;
};

const mazeTerrainModelGenerator = (numHorizontal, numVertical) => {
  const model = [];

  for (
    let horizontalIndex = 0;
    horizontalIndex < numHorizontal;
    horizontalIndex++
  ) {
    for (let verticalIndex = 0; verticalIndex < numVertical; verticalIndex++) {
      // Add a "floor" cube in every coordinate
      model.push({
        x: horizontalIndex,
        y: verticalIndex,
        z: 0
      });

      if (horizontalIndex % 2 === 1) {
        if (horizontalIndex % 4 === 1 && verticalIndex < numVertical - 1) {
          model.push({
            x: horizontalIndex,
            y: verticalIndex,
            z: 1
          });
        } else if ((horizontalIndex + 2) % 4 === 1 && verticalIndex > 0) {
          model.push({
            x: horizontalIndex,
            y: verticalIndex,
            z: 1
          });
        }
      }
    }
  }

  return model;
};

// Terrain objects are a set of blocks (cubes) whose purpose is to limit
// the robot's movement, i.e. a robot may not pass through a cube.
const terrainFactory = options => {
  options = _.defaults({}, options, {
    image: ""
  });

  const {
    // An array of { x: , y: , z: } (where the combination x/y/z is unique
    terrainModel,
    image
  } = options;

  const terrainCubes = terrainModel.map(cubeCoords => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    var material;
    if (image !== "") {
      const texture = new THREE.TextureLoader().load(image);
      material = new THREE.MeshBasicMaterial({ map: texture });
      texture.needsUpdate = true;
    } else {
      material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    }

    const cube = new THREE.Mesh(geometry, material);

    const { x, y, z } = cubeCoords;

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    return cube;
  });

  // Create outlines for the cubes too so that it is easier to visualize
  // how many cubes there are in a given path.
  const terrainCubesOutlines = terrainCubes.map(cube => {
    const geometry = new THREE.EdgesGeometry(cube.geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      linewidth: 10
    });
    const outline = new THREE.LineSegments(geometry, material);

    outline.position.x = cube.position.x;
    outline.position.y = cube.position.y;
    outline.position.z = cube.position.z;

    return outline;
  });

  const addToScene = scene => {
    terrainCubes.forEach(cube => {
      scene.add(cube);
    });

    terrainCubesOutlines.forEach(outline => {
      scene.add(outline);
    });
  };

  const doesCubeExistAt = coordinates => {
    return _.some(terrainModel, terrainCoordinate => {
      return (
        terrainCoordinate.x === Math.floor(coordinates.x) &&
        terrainCoordinate.y === Math.floor(coordinates.y) &&
        terrainCoordinate.z === Math.floor(coordinates.z)
      );
    });
  };

  const areCoordinatesOccupied = doesCubeExistAt;

  const canRobotStepOn = coordinates => {
    // First the coordinates to consider to move to must not be blocked
    return (
      !doesCubeExistAt(coordinates) &&
      // and there must be a floor
      doesCubeExistAt(Object.assign({}, coordinates, { z: coordinates.z - 1 }))
    );
  };

  return Object.freeze({
    addToScene,
    doesCubeExistAt,
    areCoordinatesOccupied,
    canRobotStepOn
  });
};

const worldFactory = options => {
  const { robotOptions, terrainOptions, targetOptions, homeElement } = options;

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(homeElement.clientWidth, homeElement.clientHeight);
  document.getElementById("canvas-area").appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    75,
    homeElement.clientWidth / homeElement.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 15;
  camera.position.y = 7.5;
  camera.position.x = 7.5;
  camera.lookAt(new THREE.Vector3(7.5, 7.5, 0));

  const robot = robotFactory(robotOptions);
  robot.addToScene(scene);

  const { x: targetX, y: targetY, z: targetZ } = targetOptions;

  const target = targetFactory(targetOptions);
  target.addToScene(scene);

  const terrain = terrainFactory(terrainOptions);
  terrain.addToScene(scene);

  const isFrontOfRobotBlocked = () => {
    const positionInFrontOfRobot = robot.getCoordinatesInFront();
    return !terrain.canRobotStepOn(positionInFrontOfRobot);
  };

  // A function to move the robot, aware of its surroundings, it won't
  // let it go where is no floor or the path is blocked.
  const moveRobot = amount => {
    if (isFrontOfRobotBlocked()) {
      // Move not allowed if robot is standing and the front is blocked
      return;
    }
    robot.move(amount);
  };

  // A function to determine if the robot is standing on top of the target.
  const isRobotOnTarget = () => {
    const robotPosition = robot.getCurrentCoordinates();

    return (
      robotPosition.x === targetX &&
      robotPosition.y === targetY &&
      robotPosition.z === targetZ
    );
  };

  let instructions = []; // The name of the instructions
  let programCounter = -1; // The index of the instruction being executed
  let currentInstructionName = undefined;
  let currentInstruction = _.noop;
  let currentInstructionArgs = [];
  let insideWhile = false;
  let whileInstructionIndex = -1;

  const INSTRUCTION_SET = new WeakMap();

  INSTRUCTION_SET[TRUE] = () => true;
  INSTRUCTION_SET[FALSE] = () => false;

  INSTRUCTION_SET[MOVE_FORWARD] = timeSmoothUnaryFunctionFactory(
    moveRobot,
    1,
    robot.advancePosition
  );

  INSTRUCTION_SET[TURN_RIGHT] = timeSmoothUnaryFunctionFactory(
    robot.rotateRight, 90, robot.turnRight);

  INSTRUCTION_SET[TURN_LEFT] = timeSmoothUnaryFunctionFactory(
    robot.rotateLeft, 90, robot.turnLeft);

  /* INSTRUCTION_SET[TURN_RIGHT] = callableOnlyOnceFunctionFactory(
   *   robot.turnRight
   * );
   * INSTRUCTION_SET[TURN_LEFT] = callableOnlyOnceFunctionFactory(robot.turnLeft);*/

  INSTRUCTION_SET[ROBOT_IS_FACING_NORTH] = () => robot.isFacingNorth();
  INSTRUCTION_SET[ROBOT_IS_FACING_WEST] = () => robot.isFacingWest();
  INSTRUCTION_SET[ROBOT_IS_FACING_SOUTH] = () => robot.isFacingSouth();
  INSTRUCTION_SET[ROBOT_IS_FACING_EAST] = () => robot.isFacingEast();

  INSTRUCTION_SET[GOTO] = callableOnlyOnceFunctionFactory(
    args => (programCounter = +args[0] - 1)
  );

  INSTRUCTION_SET[WHILE] = callableOnlyOnceFunctionFactory(args => {
    const predicateInstructionName = args[0];
    const predicate = INSTRUCTION_SET[predicateInstructionName];

    if (predicate()) {
      insideWhile = true;
      whileInstructionIndex = programCounter;
    } else {
      whileInstructionIndex = undefined;

      // Jump to the next instruction after the matching 'ENDWHILE'
      let candidateNextInstructionIndex = programCounter + 1;

      let candidateNextInstruction =
        instructions[candidateNextInstructionIndex];
      let candidateNextInstructionName = candidateNextInstruction[0];

      while (candidateNextInstructionName !== ENDWHILE) {
        candidateNextInstructionIndex++;
        candidateNextInstruction = instructions[candidateNextInstructionIndex];
        candidateNextInstructionName = candidateNextInstruction[0];
      }

      // At this point the candidateNextInstructionIndex is equal to the
      // index of the endwhile, so we increase by one
      programCounter = candidateNextInstructionIndex - 1;
    }
  });

  INSTRUCTION_SET[ENDWHILE] = callableOnlyOnceFunctionFactory(args => {
    if (insideWhile) {
      programCounter = whileInstructionIndex - 1;
    }
  });

  INSTRUCTION_SET[IF] = callableOnlyOnceFunctionFactory(args => {
    const predicateInstructionName = args[0];
    const predicate = INSTRUCTION_SET[predicateInstructionName];

    if (predicate()) {
      // Do nothing and continue onto the next instruction
    } else {
      // Jump to the next instruction after the matching 'ELSE' or 'ENDIF'
      let candidateNextInstructionIndex = programCounter + 1;
      let candidateNextInstruction =
        instructions[candidateNextInstructionIndex];
      let candidateNextInstructionName = candidateNextInstruction[0];

      while (
        candidateNextInstructionName !== ENDIF &&
        candidateNextInstructionName !== ELSE
      ) {
        candidateNextInstructionIndex++;
        candidateNextInstruction = instructions[candidateNextInstructionIndex];
        candidateNextInstructionName = candidateNextInstruction[0];
      }

      // At this point the candidateNextInstructionIndex is equal to the
      // index of the ENDIF, so we increase by one
      programCounter = candidateNextInstructionIndex - 1;

      if (candidateNextInstructionName === ELSE) {
        programCounter = candidateNextInstructionIndex;
      }
    }
  });

  INSTRUCTION_SET[ENDIF] = () => _.noop;

  INSTRUCTION_SET[ELSE] = callableOnlyOnceFunctionFactory(args => {
    // If the else instruction is reached, then the if was accepted,
    // as when its not accepted the programCounter moves 1 past the
    // the matching else. Then, since the if was accepted, we want
    // to move past any possible instructions after an else, to the
    // next instruction after an ENDIF

    // Jump to the next instruction after the matching 'ELSE' or 'ENDIF'
    let candidateNextInstructionIndex = programCounter + 1;
    let candidateNextInstruction = instructions[candidateNextInstructionIndex];
    let candidateNextInstructionName = candidateNextInstruction[0];

    while (candidateNextInstructionName !== ENDIF) {
      candidateNextInstructionIndex++;
      candidateNextInstruction = instructions[candidateNextInstructionIndex];
      candidateNextInstructionName = candidateNextInstruction[0];
    }

    // At this point the candidateNextInstructionIndex is equal to the
    // index of the ENDIF, so we increase by one
    programCounter = candidateNextInstructionIndex - 1;
  });

  INSTRUCTION_SET[FRONT_IS_BLOCKED] = () => isFrontOfRobotBlocked();

  INSTRUCTION_SET[FRONT_IS_NOT_BLOCKED] = () => !isFrontOfRobotBlocked();

  INSTRUCTION_SET[ROBOT_IS_ON_TARGET] = () => isRobotOnTarget();

  INSTRUCTION_SET[ROBOT_IS_NOT_ON_TARGET] = () => !isRobotOnTarget();

  const render = () => {
    renderer.render(scene, camera);
  }

  const update = (obj, options) => {
    switch (obj) {
      case "terrain":
        scene.remove(terrain);
        terrain = terrainFactory(options);
        terrain.addToScene(scene);
        render();
        break;
      default:
        break;
    }
  }

  const run = (callback) => {
    // Begins the animation loop of the world.
    //
    // callback is a function that will be called at the end of each
    //   1 second period and will be given the names of the instructions being
    //   executed and the index of the one that is currently being executed.
    //
    //
    // In order to improve visualization, we have determined that each program
    // instruction will take 1 second to complete (in the future we could make this
    // a configurable --speed-- value). This poses some challenges.
    // For example, one action can be "move an object one unit forward", so
    // during each frame within the 1 second period that corresponds to the
    // action, we want to move the distance proportional to the time that has
    // passed since the last frame, e.g., if this frame is 16 milliseconds after
    // the one before it, the graphics are 16 milliseconds out of date, and we
    // should move the object forward by 16/1000 of the total distance it will move.
    //
    // It has been established that the program instructions will need to consume
    // the time that has passed since the previous frame so that they may act
    // proportionally.
    //
    // There is also the issue that not all program instructions can be "amortized"
    // during a time period. For example, the "turn right" instruction happens
    // instantly, and it would be an error to keep calling the turnRight method
    // as many times as there are frames in the 1 second that belongs to the
    // instruction, as we may end facing in some other direction, so there is
    // a subset of actions that we want to be executed only in the first frame
    // of their one second period, and do nothing in the rest.
    //
    // In order to reduce complexity, we will utilize higher order functions
    // to create stateful, animation frame aware instructions. See the
    // Higher order functions section for more iformation. But basically
    // 
    // This function assumes compileUserScript() has been called successfully

    let millisecondsInCurrentPeriod = 0;
    let then = new Date().getTime();

    const animate = () => {
      requestAnimationFrame(animate);

      let now = new Date().getTime();
      let millisecondsDelta = now - then;

      currentInstruction(millisecondsDelta, currentInstructionArgs);

      millisecondsInCurrentPeriod += millisecondsDelta;

      const isTimeToMoveToNextInstruction = millisecondsInCurrentPeriod > 1000;

      if (isTimeToMoveToNextInstruction) {

        const isLastInstruction = programCounter === (instructions.length - 1);

        if (isLastInstruction) {
          currentInstruction = _.noop;
        } else {
          programCounter = programCounter + 1;
          currentInstruction = INSTRUCTION_SET[instructions[programCounter][0]]();
          currentInstructionArgs = instructions[programCounter].slice(1);
          callback(instructions, programCounter);
        }

        millisecondsInCurrentPeriod = 0;
      }

      then = now;

      render();
    }

    callback(instructions, 0);
    animate();
  }

  const compileUserScript = userScript => {
    // Assumes one command per line, all lines contain commands.
    instructions = userScript.split("\n").map(statement => {
      const trimmedStatement = statement.trim();
      return trimmedStatement.split(" ");
    });

    currentInstructionName = instructions[0][0];
    currentInstruction = INSTRUCTION_SET[instructions[0][0]]();
    currentInstructionArgs = instructions[0].slice(1);
  };

  const rotateCamera = (axis, angleAfterRotation) => {
    camera.rotation[axis] = angleAfterRotation * Math.PI / 180;
  };

  const panCamera = (axis, amount) => {
    camera.position[axis] += amount;
  };

  return Object.freeze({
    render,
    compileUserScript,
    run,
    rotateCamera,
    panCamera
  });
}
