namespace donkeykong {
    // Custom sprite kinds
    // namespace SpriteKind {
    //     export const UI = SpriteKind.create()
    // }

    // Enums
    enum GameState {
        MainMenu,
        Gameplay
    }

    enum AnimState {
        Idle,
        WalkRight,
        WalkLeft,
        Jumping
    }

    enum Corner {
        TopLeft,
        TopRight,
        BottomLeft,
        BottomRight
    }

    enum Direction {
        Left,
        Right
    }

    // Initialise variables

    // Control
    let debugMode: boolean = true
    let gridEnabled: boolean = false
    let gameState: number = null
    let inputEnabled: boolean = true

    // Player
    let playerSprite: Sprite = null
    let playerAnimState: number = AnimState.Idle
    let playerDirection: number = Direction.Right
    let playerSpeed: number = 30
    let playerJumpForce: number = 100
    let gravityStrength: number = 200
    let playerIsInAir: boolean = false
    let isClimbing: boolean = false

    // Obstacles
    let girders: Sprite[] = []

    // Color
    let defaultPallete: color.Palette = color.hexArrayToPalette([
        0x000000,
        0xffffff,
        0xa40000,
        0xfc78fc,
        0xd82800,
        0xfc9838,
        0x2038ec,
        0x800080,
        0x0000a8,
        0x00e8d8,
        0xe40058,
        0xfcbcb0,
        0x8000f0,
        0xfcd8a8,
        0xc84c0c,
        0x000000
    ])

    // Sounds

    // Main menu
    let menuCursor: Sprite = null
    let gameType: number = 0




    // Snaps sprites to 8x8 grid
    function snapToGrid(sprite: Sprite, corner: number, col: number, row: number) {
        if (corner == Corner.TopLeft) {
            sprite.left = col * 8
            sprite.top = row * 8
        } else if (corner == Corner.TopRight) {
            sprite.right = (col + 1) * 8
            sprite.top = row * 8
        } else if (corner == Corner.BottomLeft) {
            sprite.left = col * 8
            sprite.bottom = (row + 1) * 8
        } else if (corner == Corner.BottomRight) {
            sprite.right = (col + 1) * 8
            sprite.bottom = (row + 1) * 8
        }

    }

    function mainMenu() {
        gameState = GameState.MainMenu
        inputEnabled = true
        
        scene.setBackgroundImage(assets.image`DkMenuBg`)
        music.play(music.createSong(assets.song`DkMenuTheme`), music.PlaybackMode.LoopingInBackground)
        menuCursor = sprites.create(assets.image`DkMenuCursor`, SpriteKind.UI)
        snapToGrid(menuCursor, Corner.TopLeft, 7, 16)
    }

    function loadGame() {
        inputEnabled = false
        gameState = GameState.Gameplay

        scene.setBackgroundColor(15)

        playerSprite = sprites.create(assets.image`DkJumpman`, SpriteKind.Player)
        snapToGrid(playerSprite, Corner.BottomLeft, 6, 26)

        let oilBarrel: Sprite = sprites.create(assets.image`DkOilBarrel`, SpriteKind.DkOilBarrel)
        snapToGrid(oilBarrel, Corner.BottomLeft, 4, 26)

        let girder: Sprite = sprites.create(assets.image`DkGirder0`, SpriteKind.DkGirder)
        snapToGrid(girder, Corner.BottomLeft, 1, 27)
        girders[0] = girder

        music.play(music.createSong(assets.song`DkLevelStartTheme`), music.PlaybackMode.UntilDone)
        pause(100)
        music.setVolume(255)
        music.play(music.createSong(assets.song`DkLevelTheme1`), music.PlaybackMode.LoopingInBackground)
        music.setVolume(128)
        inputEnabled = true
    }

    function updatePlayerAnimations(anim: number) {
        if (anim == AnimState.Idle) {
            if (playerAnimState == AnimState.Jumping) {
                if (playerDirection == Direction.Right) {
                    animation.runImageAnimation(playerSprite, assets.animation`DkJumpmanLandRightAnim`, 150, false)
                } else {
                    animation.runImageAnimation(playerSprite, assets.animation`DkJumpmanLandLeftAnim`, 150, false)
                }
            } else {
                animation.stopAnimation(animation.AnimationTypes.ImageAnimation, playerSprite)
            }
            playerAnimState = AnimState.Idle
        } else if (anim == AnimState.WalkRight) {
            playerAnimState = AnimState.WalkRight
            playerDirection = Direction.Right
            animation.runImageAnimation(playerSprite, assets.animation`DkJumpmanWalkRightAnim`, 70, true)
        } else if (anim == AnimState.WalkLeft) {
            playerAnimState = AnimState.WalkLeft
            playerDirection = Direction.Left
            animation.runImageAnimation(playerSprite, assets.animation`DkJumpmanWalkLeftAnim`, 70, true)
        } else if (anim == AnimState.Jumping) {
            playerAnimState = AnimState.Jumping
            animation.stopAnimation(animation.AnimationTypes.ImageAnimation, playerSprite)
            if (playerDirection == Direction.Right) {
                playerSprite.setImage(assets.image`DkJumpmanJumpRight`)
            } else {
                playerSprite.setImage(assets.image`DkJumpmanJumpLeft`)
            }

        }
    }

    function onGameUpdate() {
        if (gameState == GameState.Gameplay) {
            if (playerIsInAir) {
                if (playerSprite.overlapsWith(girders[0])) {
                    playerSprite.ay = 0
                    playerSprite.vy = 0
                    playerSprite.vx = 0
                    playerSprite.y += 1
                    playerSprite.y = Math.round(playerSprite.y)
                    while (playerSprite.overlapsWith(girders[0])) {
                        playerSprite.y -= 1
                    }
                    updatePlayerAnimations(AnimState.Idle)
                    playerIsInAir = false
                }
            } else {
                // Collision with girders
                playerSprite.y += 1
                while (playerSprite.overlapsWith(girders[0])) {
                    playerSprite.y -= 1
                }

                // Player Walking
                if ((playerAnimState == AnimState.WalkRight) && (!controller.right.isPressed()) && inputEnabled) {
                    if (controller.left.isPressed()) {
                        console.log("a")
                        playerSprite.vx = -playerSpeed
                        updatePlayerAnimations(AnimState.WalkLeft)
                    } else {
                        playerSprite.vx = 0
                        updatePlayerAnimations(AnimState.Idle)
                    }
                } else if ((playerAnimState == AnimState.WalkLeft) && (!controller.left.isPressed()) && inputEnabled) {
                    if (controller.right.isPressed()) {
                        playerSprite.vx = playerSpeed
                        updatePlayerAnimations(AnimState.WalkRight)
                    } else {
                        playerSprite.vx = 0
                        updatePlayerAnimations(AnimState.Idle)
                    }
                } else if ((playerAnimState == AnimState.Idle) && inputEnabled) {
                    if (controller.right.isPressed()) {
                        playerSprite.vx = playerSpeed
                        updatePlayerAnimations(AnimState.WalkRight)
                    } else if (controller.left.isPressed()) {
                        playerSprite.vx = -playerSpeed
                        updatePlayerAnimations(AnimState.WalkLeft)
                    }
                }



            }

        }
    }

    function walkSound() {
        if ((playerAnimState == AnimState.WalkLeft) || (playerAnimState == AnimState.WalkRight)) {
            music.setVolume(255)
            music.play(music.createSoundEffect(WaveShape.Sawtooth, randint(500, 700), 700, 255, 100, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
            music.setVolume(128)
        }
    }

    function onAButtonPressed() {
        //console.log("A button pressed")
        if (!inputEnabled) {
            return
        }
        
        if (gameState == GameState.MainMenu) {
            console.log("Main menu")
            inputEnabled = false
            music.stopAllSounds()
            music.play(music.createSong(assets.song`DkMenuStartTheme`), music.PlaybackMode.UntilDone)
            sprites.destroy(menuCursor)
            scene.setBackgroundImage(assets.image`EmptyBg`)
            pause(100)
            loadGame()
        } else if (gameState == GameState.Gameplay) {
            if (!playerIsInAir) {
                playerIsInAir = true
                playerSprite.vy = -playerJumpForce
                playerSprite.ay = gravityStrength
                music.setVolume(255)
                music.play(music.createSoundEffect(WaveShape.Sawtooth, 759, 513, 255, 79, 1000, SoundExpressionEffect.None, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
                music.setVolume(128)
                updatePlayerAnimations(AnimState.Jumping)
            }
        }
    }
    
    function onBButtonPressed() {
        //console.log("B button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            inputEnabled = false
            music.stopAllSounds()
            music.play(music.melodyPlayable(music.beamUp), music.PlaybackMode.InBackground)
            color.startFadeFromCurrent(color.White, 1000)
            timer.after(2000, function () {
                gameState = null
                sprites.destroyAllSpritesOfKind(SpriteKind.UI)
                scene.setBackgroundImage(assets.image`EmptyBg`)
                returnToMainMenu()
            }) 
        } else if (gameState == GameState.Gameplay) {
            if (debugMode) {
                if (gridEnabled) {
                    scene.setBackgroundImage(assets.image`EmptyBg`)
                } else {
                    scene.setBackgroundImage(assets.image`GridBg`)
                }
                gridEnabled = !gridEnabled
            }
        }
    }

    function onRightButtonPressed() {
        //console.log("Right button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            return
        } else if (gameState == GameState.Gameplay) {
            return
        }
    }

    function onLeftButtonPressed() {
        //console.log("Left button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            return
        } else if (gameState == GameState.Gameplay) {
            return
        }
    }

    function onUpButtonPressed() {
        //console.log("Up button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            gameType = (gameType + 3) % 4
            //console.log(gameType)
            snapToGrid(menuCursor, Corner.TopLeft, 7, 16 + gameType * 2)
        }
    }

    function onDownButtonPressed() {
        //console.log("Down button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            gameType = (gameType + 1) % 4
            //console.log(gameType)
            snapToGrid(menuCursor, Corner.TopLeft, 7, 16 + gameType * 2)
        }
    }

    function onRightButtonReleased() {
        if (!inputEnabled) {
            return
        }
    }

    function onLeftButtonReleased() {
        if (!inputEnabled) {
            return
        }
    }

    export function startGame() {
        game.onUpdate(onGameUpdate)
        game.onUpdateInterval(200, walkSound)
        controller.A.onEvent(ControllerButtonEvent.Pressed, onAButtonPressed)
        controller.B.onEvent(ControllerButtonEvent.Pressed, onBButtonPressed)
        controller.right.onEvent(ControllerButtonEvent.Pressed, onRightButtonPressed)
        controller.left.onEvent(ControllerButtonEvent.Pressed, onLeftButtonPressed)
        controller.up.onEvent(ControllerButtonEvent.Pressed, onUpButtonPressed)
        controller.down.onEvent(ControllerButtonEvent.Pressed, onDownButtonPressed)

        controller.right.onEvent(ControllerButtonEvent.Released, onRightButtonReleased)
        controller.left.onEvent(ControllerButtonEvent.Released, onLeftButtonReleased)

        gameType = 0
        
        music.stopAllSounds()
        color.setPalette(defaultPallete)
        gameState = GameState.MainMenu
        mainMenu()

        //loadGame()
    }
}