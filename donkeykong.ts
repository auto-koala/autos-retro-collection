namespace donkeykong {
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
    let playerSpriteImg: Sprite = null
    let playerAnimState: number = AnimState.Idle
    let playerDirection: number = Direction.Right
    let playerSpeed: number = 30
    let playerJumpForce: number = 75
    let gravityStrength: number = 200
    let playerIsInAir: boolean = false
    let isClimbing: boolean = false

    // Obstacles
    let girders: Sprite = null

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

    // Main menu
    function mainMenu() {
        gameState = GameState.MainMenu
        inputEnabled = true
        
        // Load menu assets
        scene.setBackgroundImage(assets.image`DkMenuBg`)
        music.play(music.createSong(assets.song`DkMenuTheme`), music.PlaybackMode.LoopingInBackground)
        menuCursor = sprites.create(assets.image`DkMenuCursor`, SpriteKind.UI)
        snapToGrid(menuCursor, Corner.TopLeft, 7, 16)
    }

    // Loads the game
    function loadGame() {
        inputEnabled = false
        gameState = GameState.Gameplay

        scene.setBackgroundColor(15)


        // Create oil barrel
        let oilBarrel: Sprite = sprites.create(assets.image`DkOilBarrel`, SpriteKind.DkOilBarrel)
        snapToGrid(oilBarrel, Corner.BottomLeft, 4, 26)

        // Create girders
        let girdersImg: Sprite = sprites.create(assets.image`DkGirders`, SpriteKind.SpriteImage)
        snapToGrid(girdersImg, Corner.BottomLeft, 1, 27)

        girders = sprites.create(assets.image`DkGirdersHitbox`, SpriteKind.DkGirder)
        girders.setFlag(SpriteFlag.Invisible, true)
        snapToGrid(girders, Corner.BottomLeft, 1, 27)

        // Create player
        playerSpriteImg = sprites.create(assets.image`DkJumpman`, SpriteKind.SpriteImage)

        playerSprite = sprites.create(assets.image`DkJumpmanHitbox`, SpriteKind.Player)
        playerSprite.setFlag(SpriteFlag.Invisible, true)
        snapToGrid(playerSprite, Corner.BottomLeft, 6, 26)
        
        playerSpriteImg.x = playerSprite.x
        playerSpriteImg.bottom = playerSprite.bottom

        // Play opening music
        music.setVolume(128)
        music.play(music.createSong(assets.song`DkLevelStartTheme`), music.PlaybackMode.UntilDone)
        pause(100)
        music.setVolume(255)
        music.play(music.createSong(assets.song`DkLevelTheme1`), music.PlaybackMode.LoopingInBackground)
        music.setVolume(128)

        // Enable player input
        inputEnabled = true
    }

    // Handles all player animations
    function updatePlayerAnimations(anim: number) {
        // Prevents same animation being reactivated
        if (anim == playerAnimState) {
            return
        }

        if (anim == AnimState.Idle) {
            // Transition from jumping to landing
            if (playerAnimState == AnimState.Jumping) {
                if (playerDirection == Direction.Right) {
                    animation.runImageAnimation(playerSpriteImg, assets.animation`DkJumpmanLandRightAnim`, 150, false)
                } else {
                    animation.runImageAnimation(playerSpriteImg, assets.animation`DkJumpmanLandLeftAnim`, 150, false)
                }
            } else {
                animation.stopAnimation(animation.AnimationTypes.ImageAnimation, playerSpriteImg)
            }
            playerAnimState = AnimState.Idle
            
        } else if (anim == AnimState.WalkRight) {
            playerAnimState = AnimState.WalkRight
            playerDirection = Direction.Right
            animation.runImageAnimation(playerSpriteImg, assets.animation`DkJumpmanWalkRightAnim`, 70, true)

        } else if (anim == AnimState.WalkLeft) {
            playerAnimState = AnimState.WalkLeft
            playerDirection = Direction.Left
            animation.runImageAnimation(playerSpriteImg, assets.animation`DkJumpmanWalkLeftAnim`, 70, true)

        } else if (anim == AnimState.Jumping) {
            playerAnimState = AnimState.Jumping
            animation.stopAnimation(animation.AnimationTypes.ImageAnimation, playerSpriteImg)
            if (playerDirection == Direction.Right) {
                playerSpriteImg.setImage(assets.image`DkJumpmanJumpRight`)
            } else {
                playerSpriteImg.setImage(assets.image`DkJumpmanJumpLeft`)
            }

        }
    }

    // Game loop
    function onGameUpdate() {
        if (gameState == GameState.Gameplay) {
            if (playerIsInAir) {
                // Player lands
                if (playerSprite.overlapsWith(girders)) {
                    playerSprite.ay = 0
                    playerSprite.vy = 0
                    playerSprite.vx = 0
                    playerSprite.y += 1
                    playerSprite.y = Math.round(playerSprite.y)
                    // Prevents player getting stuck in girders
                    while (playerSprite.overlapsWith(girders)) {
                        playerSprite.y -= 1
                    }
                    updatePlayerAnimations(AnimState.Idle)
                    playerIsInAir = false
                }
            } else {
                // Collision with girders
                playerSprite.y += 1
                while (playerSprite.overlapsWith(girders)) {
                    playerSprite.y -= 1
                }

                // Player walking
                if (controller.right.isPressed() && inputEnabled) {
                    playerSprite.vx = playerSpeed
                    updatePlayerAnimations(AnimState.WalkRight)
                } else if (controller.left.isPressed() && inputEnabled) {
                    playerSprite.vx = -playerSpeed
                    updatePlayerAnimations(AnimState.WalkLeft)
                } else {
                    playerSprite.vx = 0
                    updatePlayerAnimations(AnimState.Idle)
                }
            }

            // Update player image
            playerSpriteImg.x = playerSprite.x
            playerSpriteImg.bottom = playerSprite.bottom

        }
    }

    // Generates footstep sound when player is walking
    function walkSound() {
        if ((playerAnimState == AnimState.WalkLeft) || (playerAnimState == AnimState.WalkRight)) {
            music.setVolume(255)
            music.play(music.createSoundEffect(WaveShape.Sawtooth, randint(500, 700), 700, 255, 100, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
            music.setVolume(128)
        }
    }

    // Runs when the A button is pressed
    function onAButtonPressed() {
        if (!inputEnabled) {
            return
        }
        
        // Selects a game mode and loads game
        if (gameState == GameState.MainMenu) {
            inputEnabled = false
            music.stopAllSounds()
            music.play(music.createSong(assets.song`DkMenuStartTheme`), music.PlaybackMode.UntilDone)
            // Clears menu
            sprites.destroy(menuCursor)
            scene.setBackgroundImage(assets.image`EmptyBg`)
            pause(100)
            // Loads game
            loadGame()
        
        // Player jump
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
    
    // Runs when the B button is pressed
    function onBButtonPressed() {
        if (!inputEnabled) {
            return
        }
        // Return to main menu
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

        // Enable debug mode
        } else if (gameState == GameState.Gameplay) {
            if (debugMode) {
                gridEnabled = !gridEnabled
                // Show hitboxes
                playerSprite.setFlag(SpriteFlag.Invisible, !gridEnabled)
                girders.setFlag(SpriteFlag.Invisible, !gridEnabled)

                if (gridEnabled) {
                    scene.setBackgroundImage(assets.image`GridBg`)  // Show grid
                    playerJumpForce *= 1.5  // Increase player jump force
                } else {
                    scene.setBackgroundImage(assets.image`EmptyBg`)
                    playerJumpForce /= 1.5
                }
            }
        }
    }

    function onRightButtonPressed() {
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
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
            return
        } else if (gameState == GameState.Gameplay) {
            return
        }
    }

    
    // Runs when up button is pressed
    function onUpButtonPressed() {
        if (!inputEnabled) {
            return
        }

        // Switch game type
        if (gameState == GameState.MainMenu) {
            gameType = (gameType + 3) % 4
            snapToGrid(menuCursor, Corner.TopLeft, 7, 16 + gameType * 2)
        }
    }

        // Runs when down button is pressed
    function onDownButtonPressed() {
        if (!inputEnabled) {
            return
        }

        // Switch game type
        if (gameState == GameState.MainMenu) {
            gameType = (gameType + 1) % 4
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

    // Starts game
    export function startGame() {
        // Bind events
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
        // gameState = GameState.MainMenu
        // mainMenu()

        loadGame()
    }
}