namespace donkeykong {
    // Custom sprite kinds
    // namespace SpriteKind {
    //     export const UI = SpriteKind.create()
    // }

    // Enums
    enum GameState {
        MainMenu
    }


    // Initialise variables

    // Control
    let gameState: number = null
    let inputEnabled: boolean = true

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
    function setTilePosition(sprite: Sprite, col: number, row: number) {
        sprite.left = col * 8
        sprite.top = row * 8
    }

    function mainMenu() {
        gameState = GameState.MainMenu
        inputEnabled = true
        
        scene.setBackgroundImage(assets.image`DkMenuBg`)
        music.play(music.createSong(assets.song`DkMenuTheme`), music.PlaybackMode.LoopingInBackground)
        menuCursor = sprites.create(assets.image`DkMenuCursor`, SpriteKind.UI)
        setTilePosition(menuCursor, 7, 16)
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
            inputEnabled = false
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
        }
    }

    function onRightButtonPressed() {
        //console.log("Right button pressed")
        if (!inputEnabled) {
            return
        }

        if (gameState == GameState.MainMenu) {
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
            setTilePosition(menuCursor, 7, 16 + gameType * 2)
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
            setTilePosition(menuCursor, 7, 16 + gameType * 2)
        }
    }

    export function startGame() {
        controller.A.onEvent(ControllerButtonEvent.Pressed, onAButtonPressed)
        controller.B.onEvent(ControllerButtonEvent.Pressed, onBButtonPressed)
        controller.right.onEvent(ControllerButtonEvent.Pressed, onRightButtonPressed)
        controller.left.onEvent(ControllerButtonEvent.Pressed, onLeftButtonPressed)
        controller.up.onEvent(ControllerButtonEvent.Pressed, onUpButtonPressed)
        controller.down.onEvent(ControllerButtonEvent.Pressed, onDownButtonPressed)

        gameType = 0
        
        music.stopAllSounds()
        gameState = GameState.MainMenu
        color.setPalette(defaultPallete)
        mainMenu()
    }
}