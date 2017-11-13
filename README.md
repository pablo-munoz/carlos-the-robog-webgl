# Karel-the-robot-like implementation in webgl

If you are using the flat terrain, in the text area try the following script:

```
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
TURN_RIGHT
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
MOVE_FORWARD
TURN_RIGHT
MOVE_FORWARD
TURN_RIGHT
MOVE_FORWARD
TURN_RIGHT
MOVE_FORWARD
TURN_RIGHT
GOTO 11
```

Or if you are using the maze terrain try

```
WHILE ROBOT_IS_NOT_ON_TARGET
    IF FRONT_IS_NOT_BLOCKED
        MOVE_FORWARD
    ELSE
        IF ROBOT_IS_FACING_NORTH
            TURN_RIGHT
            MOVE_FORWARD
            MOVE_FORWARD
            TURN_RIGHT
        ELSE
            IF ROBOT_IS_FACING_SOUTH
                TURN_LEFT
                MOVE_FORWARD
                MOVE_FORWARD
                TURN_LEFT
            ENDIF
        ENDIF
    ENDIF
ENDWHILE
```
